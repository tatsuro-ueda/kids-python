const http = require("http");
const fs = require("fs");
const path = require("path");
const geoip = require("geoip-lite");

const PORT = process.env.PORT || 3000;
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

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1489343188379369512/0lFf23HKphq4ZgPXcKIMJU4nTcxMJvk0GqDELaxF8LJcX8AAoTyUW2ApqeE0X_P3zq5d";

// Rate limit: 1 request per IP per 60 seconds
const helpRateLimit = new Map();

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

  // API: help endpoint
  if (url === "/api/help" && req.method === "POST") {
    const ip = getClientIp(req);
    const now = Date.now();
    const last = helpRateLimit.get(ip) || 0;
    if (now - last < 60000) {
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
      const status = await sendDiscord({ content: content.slice(0, 2000) });
      helpRateLimit.set(ip, now);
      setSecurityHeaders(res);
      res.writeHead(status < 300 ? 200 : 502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: status < 300 }));
    } catch (e) {
      console.error("Help API error:", e);
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
    res.writeHead(200, { "Content-Type": mime });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

module.exports = server;
