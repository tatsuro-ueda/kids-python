const http = require("http");
const fs = require("fs");
const path = require("path");
const geoip = require("geoip-lite");

const PORT = process.env.PORT || 3000;
const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID || "";

// EEA (European Economic Area) + UK country codes for GDPR compliance
const EU_COUNTRIES = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR",
  "DE","GR","HU","IE","IT","LV","LT","LU","MT","NL",
  "PL","PT","RO","SK","SI","ES","SE",
  "IS","LI","NO", // EEA
  "GB",            // UK (UK GDPR)
]);

function buildGaSnippet(measurementId) {
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted'
    });
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  </script>`
}
const ROOT = __dirname;
const LOG_DIR = path.join(ROOT, "logs");
const LOG_FILE = path.join(LOG_DIR, "access.jsonl");

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".wasm": "application/wasm",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".xml": "application/xml",
  ".txt": "text/plain",
};

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress;
}

function logAccess(req, status) {
  const ip = getClientIp(req);
  const geo = geoip.lookup(ip);
  const record = {
    ts: new Date().toISOString(),
    method: req.method,
    url: req.url,
    status,
    ua: req.headers["user-agent"] || null,
    ref: req.headers["referer"] || null,
    ip,
    country: geo ? geo.country : null,
  };
  fs.appendFile(LOG_FILE, JSON.stringify(record) + "\n", (err) => {
    if (err) console.error("Log write error:", err);
  });
}

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1489402695407374397/ci71hjpxTQo8-6li1NEG1aph0KpdCTabb31j_qbkRZ7-otKj7oI0Y4PkYVnu4WOARUz3";

// Rate limit: 1 request per IP per 60 seconds
const helpRateLimit = new Map();

// --- Live share (SSE) ---
// roomId → { code, output, messages[], updatedAt, subscribers }
const liveRooms = new Map();
const LIVE_ROOM_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const LIVE_MAX_CODE_LENGTH = 100_000;
const LIVE_MAX_OUTPUT_FIELD_LENGTH = 5000;
const LIVE_ROOM_ID_REGEX = /^[A-Za-z0-9_-]{1,32}$/;

// Chat settings
const LIVE_MAX_MESSAGES = 100;          // ring buffer size
const LIVE_MAX_MESSAGE_TEXT = 100;       // chars per message
const LIVE_MAX_NAME_LENGTH = 20;
const LIVE_MAX_NONCE_LENGTH = 64;

function validateRoomId(id) {
  return typeof id === "string" && LIVE_ROOM_ID_REGEX.test(id);
}

function normalizeOutput(raw) {
  if (!raw || typeof raw !== "object") return null;
  const stdout = typeof raw.stdout === "string"
    ? raw.stdout.slice(0, LIVE_MAX_OUTPUT_FIELD_LENGTH)
    : "";
  const stderr = typeof raw.stderr === "string"
    ? raw.stderr.slice(0, LIVE_MAX_OUTPUT_FIELD_LENGTH)
    : "";
  let errorLine = null;
  if (typeof raw.errorLine === "number" && Number.isInteger(raw.errorLine) && raw.errorLine > 0) {
    errorLine = raw.errorLine;
  }
  return { stdout, stderr, errorLine };
}

function normalizeMessage(raw) {
  if (!raw || typeof raw !== "object") return null;
  const sender = raw.sender === "learner" || raw.sender === "teacher"
    ? raw.sender
    : null;
  if (!sender) return null;
  const rawText = typeof raw.text === "string" ? raw.text.trim() : "";
  if (!rawText) return null;
  if (rawText.length > LIVE_MAX_MESSAGE_TEXT) return null;
  const name = typeof raw.name === "string"
    ? raw.name.trim().slice(0, LIVE_MAX_NAME_LENGTH)
    : "";
  const nonce = typeof raw.nonce === "string"
    ? raw.nonce.slice(0, LIVE_MAX_NONCE_LENGTH)
    : "";
  return {
    id: Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8),
    sender,
    name,
    text: rawText,
    ts: Date.now(),
    nonce,
  };
}

function writeEvent(res, eventName, dataObj) {
  try {
    res.write(`event: ${eventName}\ndata: ${JSON.stringify(dataObj)}\n\n`);
    return true;
  } catch {
    return false;
  }
}

function broadcastState(room) {
  const payload = `event: state\ndata: ${JSON.stringify({ code: room.code, output: room.output })}\n\n`;
  for (const sub of room.subscribers) {
    try { sub.write(payload); } catch {
      room.subscribers.delete(sub);
    }
  }
}

function broadcastChat(room, msg) {
  const payload = `event: chat\ndata: ${JSON.stringify(msg)}\n\n`;
  for (const sub of room.subscribers) {
    try { sub.write(payload); } catch {
      room.subscribers.delete(sub);
    }
  }
}

function purgeExpiredRooms() {
  const now = Date.now();
  for (const [id, room] of liveRooms) {
    if (now - room.updatedAt > LIVE_ROOM_TTL_MS) {
      for (const sub of room.subscribers) {
        try { sub.end(); } catch {}
      }
      liveRooms.delete(id);
    }
  }
}

// Run cleanup every hour. unref() keeps this from holding the event loop open in tests.
setInterval(purgeExpiredRooms, 60 * 60 * 1000).unref();

function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}

const https = require("https");

function sendDiscord(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const url = new URL(DISCORD_WEBHOOK);
    const opts = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) },
    };
    const r = https.request(opts, (resp) => {
      let body = "";
      resp.on("data", (c) => (body += c));
      resp.on("end", () => resolve(resp.statusCode));
    });
    r.on("error", reject);
    r.write(data);
    r.end();
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
      catch { reject(new Error("Invalid JSON")); }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  let url = req.url.split("?")[0];

  // API: live share endpoints
  // GET /api/live/:id/exists   → { exists: boolean }
  // POST /api/live/:id          → update code/output & broadcast state
  // POST /api/live/:id/message  → send chat message & broadcast chat
  // GET /api/live/:id/stream    → SSE subscription (typed events)
  const liveMatch = url.match(/^\/api\/live\/([^/]+)(\/exists|\/stream|\/message)?$/);
  if (liveMatch) {
    const roomId = liveMatch[1];
    const subpath = liveMatch[2] || "";

    if (!validateRoomId(roomId)) {
      setSecurityHeaders(res);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "invalid_room_id" }));
      return;
    }

    // Lazy purge: drop the room if it has expired
    const existing = liveRooms.get(roomId);
    if (existing && Date.now() - existing.updatedAt > LIVE_ROOM_TTL_MS) {
      for (const sub of existing.subscribers) {
        try { sub.end(); } catch {}
      }
      liveRooms.delete(roomId);
    }

    // GET /api/live/:id/exists
    if (subpath === "/exists" && req.method === "GET") {
      setSecurityHeaders(res);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ exists: liveRooms.has(roomId) }));
      return;
    }

    // POST /api/live/:id  (learner pushes code and/or output)
    if (subpath === "" && req.method === "POST") {
      try {
        const body = await readBody(req);
        const code = typeof body.code === "string" ? body.code : "";
        if (code.length > LIVE_MAX_CODE_LENGTH) {
          setSecurityHeaders(res);
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "code_too_long" }));
          return;
        }
        // body.output is optional — when absent, preserve previous output.
        const hasOutput = Object.prototype.hasOwnProperty.call(body, "output");
        const outputNormalized = hasOutput ? normalizeOutput(body.output) : undefined;

        let room = liveRooms.get(roomId);
        if (!room) {
          room = {
            code,
            output: hasOutput ? outputNormalized : null,
            messages: [],
            updatedAt: Date.now(),
            subscribers: new Set(),
          };
          liveRooms.set(roomId, room);
        } else {
          room.code = code;
          if (hasOutput) room.output = outputNormalized;
          room.updatedAt = Date.now();
        }
        broadcastState(room);
        setSecurityHeaders(res);
        res.writeHead(204);
        res.end();
      } catch (e) {
        setSecurityHeaders(res);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "invalid_json" }));
      }
      return;
    }

    // POST /api/live/:id/message  (chat — learner or teacher)
    if (subpath === "/message" && req.method === "POST") {
      try {
        const body = await readBody(req);
        const msg = normalizeMessage(body);
        if (!msg) {
          setSecurityHeaders(res);
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "invalid_message" }));
          return;
        }
        const room = liveRooms.get(roomId);
        if (!room) {
          setSecurityHeaders(res);
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "room_not_found" }));
          return;
        }
        room.messages.push(msg);
        while (room.messages.length > LIVE_MAX_MESSAGES) {
          room.messages.shift();
        }
        room.updatedAt = Date.now();
        broadcastChat(room, msg);
        setSecurityHeaders(res);
        res.writeHead(204);
        res.end();
      } catch (e) {
        setSecurityHeaders(res);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "invalid_json" }));
      }
      return;
    }

    // GET /api/live/:id/stream  (SSE — multiple subscribers, typed events)
    if (subpath === "/stream" && req.method === "GET") {
      const room = liveRooms.get(roomId);
      if (!room) {
        setSecurityHeaders(res);
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "room_not_found" }));
        return;
      }
      setSecurityHeaders(res);
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      });
      // Send current state and full chat history to the new subscriber.
      writeEvent(res, "state", { code: room.code, output: room.output });
      writeEvent(res, "chat-history", { messages: room.messages });
      room.subscribers.add(res);
      // Heartbeat every 25s to keep proxies from closing the connection
      const heartbeat = setInterval(() => {
        try { res.write(": heartbeat\n\n"); } catch {}
      }, 25000);
      req.on("close", () => {
        clearInterval(heartbeat);
        room.subscribers.delete(res);
      });
      return;
    }

    setSecurityHeaders(res);
    res.writeHead(405);
    res.end("Method Not Allowed");
    return;
  }

  // API: help endpoint
  if (url === "/api/help" && req.method === "POST") {
    const ip = getClientIp(req);
    const now = Date.now();
    const last = helpRateLimit.get(ip) || 0;
    console.log(`[HELP] ip=${ip} now=${now} last=${last} diff=${now - last}ms`);
    if (now - last < 60000) {
      console.log(`[HELP] RATE LIMITED ip=${ip}`);
      setSecurityHeaders(res);
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "rate_limit" }));
      return;
    }
    try {
      const body = await readBody(req);
      const code = String(body.code || "").slice(0, 5000);
      const output = String(body.output || "").slice(0, 2000);
      const lang = String(body.lang || "?").slice(0, 10);
      const message = String(body.message || "").slice(0, 1000);
      console.log(`[HELP] parsed ok lang=${lang} code=${code.length}ch output=${output.length}ch msg=${message.length}ch`);
      const content = [
        "📩 **わからない！**",
        "",
        `💬 **メッセージ**\n${message || "(なし)"}`,
        "",
        `🌐 **言語:** ${lang}`,
        "",
        `🐍 **コード**\n\`\`\`python\n${code}\n\`\`\``,
        "",
        `⚠️ **出力**\n\`\`\`\n${output || "(なし)"}\n\`\`\``,
      ].join("\n");
      console.log(`[HELP] discord payload ${content.length}ch -> sliced to ${Math.min(content.length, 2000)}ch`);
      const status = await sendDiscord({
        content: content.slice(0, 2000),
        thread_name: `${lang} - ${message.slice(0, 40) || "help"}`,
      });
      console.log(`[HELP] discord responded status=${status}`);
      helpRateLimit.set(ip, now);
      setSecurityHeaders(res);
      res.writeHead(status < 300 ? 200 : 502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: status < 300 }));
    } catch (e) {
      console.error("[HELP] ERROR:", e);
      setSecurityHeaders(res);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "server_error" }));
    }
    return;
  }

  if (url === "/") url = "/index.html";
  if (url === "/app" || url === "/app/") url = "/app/index.html";

  // Language-specific LP: /en/ → /en/index.html
  const langMatch = url.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)\/$/);
  if (langMatch) url = `/${langMatch[1]}/index.html`;

  // Block access to logs directory
  if (url.startsWith("/logs/") || url === "/logs") {
    logAccess(req, 403);
    setSecurityHeaders(res);
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  const filePath = path.join(ROOT, url);
  const ext = path.extname(filePath);
  const mime = MIME[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      logAccess(req, 404);
      setSecurityHeaders(res);
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    logAccess(req, 200);
    setSecurityHeaders(res);

    if (ext === ".html") {
      let html = data.toString("utf-8");
      if (GA_MEASUREMENT_ID) {
        const ip = getClientIp(req);
        const geo = geoip.lookup(ip);
        const country = geo ? geo.country : null;
        const isEU = country && EU_COUNTRIES.has(country);
        const replacement = isEU ? "" : buildGaSnippet(GA_MEASUREMENT_ID);
        html = html.replace("<!-- GA_TAG -->", replacement);
      } else {
        html = html.replace("  <!-- GA_TAG -->\n", "");
      }
      res.writeHead(200, { "Content-Type": mime });
      res.end(html);
    } else {
      res.writeHead(200, { "Content-Type": mime });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

module.exports = server;
