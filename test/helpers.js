const http = require("node:http");
const path = require("node:path");

function request(port, urlPath, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.get(
      { hostname: "127.0.0.1", port, path: urlPath, headers },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () =>
          resolve({ status: res.statusCode, headers: res.headers, body })
        );
      }
    );
    req.on("error", reject);
  });
}

function startServer() {
  return new Promise((resolve) => {
    delete require.cache[require.resolve("../server.js")];
    process.env.PORT = "0";
    const server = require("../server.js");
    server.on("listening", () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
}

function stopServer(server) {
  return new Promise((resolve) => {
    server.close(resolve);
  });
}

module.exports = { request, startServer, stopServer };
