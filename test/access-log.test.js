const { describe, it, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const LOG_DIR = path.join(__dirname, "..", "logs");
const LOG_FILE = path.join(LOG_DIR, "access.jsonl");

function request(port, urlPath, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.get(
      { hostname: "127.0.0.1", port, path: urlPath, headers },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode, body }));
      }
    );
    req.on("error", reject);
  });
}

function waitForLog(expectedLines = 1, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (fs.existsSync(LOG_FILE)) {
        const content = fs.readFileSync(LOG_FILE, "utf-8").trim();
        const lines = content ? content.split("\n") : [];
        if (lines.length >= expectedLines) {
          return resolve(lines.map((l) => JSON.parse(l)));
        }
      }
      if (Date.now() - start > timeoutMs) {
        return reject(new Error("Timed out waiting for log entries"));
      }
      setTimeout(check, 50);
    };
    check();
  });
}

describe("Access Log", () => {
  let server;
  let port;

  before(() => {
    // Clean up logs before starting
    if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);

    // We need to start the server on a random port for testing.
    // Require the server module — we'll refactor server.js to export a createServer fn.
    delete require.cache[require.resolve("../server.js")];

    return new Promise((resolve) => {
      // Override PORT via env
      process.env.PORT = "0";
      server = require("../server.js");
      server.on("listening", () => {
        port = server.address().port;
        resolve();
      });
    });
  });

  after(() => {
    return new Promise((resolve) => {
      server.close(resolve);
    });
  });

  beforeEach(() => {
    // Clear log file between tests
    if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);
  });

  it("should append a JSONL record to access.jsonl on GET request", async () => {
    await request(port, "/app/index.html");
    const records = await waitForLog(1);
    assert.equal(records.length, 1);
  });

  it("should include all required fields (ts, method, url, status, ua, ref, ip, country)", async () => {
    await request(port, "/app/index.html", {
      "user-agent": "TestBot/1.0",
      referer: "https://example.com",
    });
    const records = await waitForLog(1);
    const r = records[0];

    assert.ok(r.ts, "ts should exist");
    assert.equal(r.method, "GET");
    assert.equal(r.url, "/app/index.html");
    assert.equal(r.status, 200);
    assert.equal(r.ua, "TestBot/1.0");
    assert.equal(r.ref, "https://example.com");
    assert.ok(r.ip, "ip should exist");
    assert.ok("country" in r, "country field should exist");
  });

  it("should record status 404 for non-existent URLs", async () => {
    await request(port, "/nonexistent-path-12345");
    const records = await waitForLog(1);
    assert.equal(records[0].status, 404);
  });

  it("should set country to null when GeoIP cannot resolve (localhost)", async () => {
    await request(port, "/app/index.html");
    const records = await waitForLog(1);
    assert.equal(records[0].country, null);
  });

  it("should block direct access to logs/access.jsonl", async () => {
    // First make a request to generate a log entry
    await request(port, "/app/index.html");
    await waitForLog(1);

    // Now try to access the log file directly
    const res = await request(port, "/logs/access.jsonl");
    assert.equal(res.status, 403);
  });
});
