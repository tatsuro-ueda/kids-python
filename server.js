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

function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}

const server = http.createServer((req, res) => {
  let url = req.url.split("?")[0];

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
