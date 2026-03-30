const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const ROOT = __dirname;

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

http.createServer((req, res) => {
  let url = req.url.split("?")[0];

  if (url === "/") url = "/index.html";
  if (url === "/app" || url === "/app/") url = "/app/index.html";

  // Language-specific LP: /en/ → /en/index.html
  const langMatch = url.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)\/$/);
  if (langMatch) url = `/${langMatch[1]}/index.html`;

  const filePath = path.join(ROOT, url);
  const ext = path.extname(filePath);
  const mime = MIME[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": mime });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
