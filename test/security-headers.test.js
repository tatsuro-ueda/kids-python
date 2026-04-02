const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { request, startServer, stopServer } = require("./helpers");

const EXPECTED_HEADERS = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};

describe("Security Headers", () => {
  let server;
  let port;

  before(async () => {
    const started = await startServer();
    server = started.server;
    port = started.port;
  });

  after(() => stopServer(server));

  describe("200 response", () => {
    it("should include X-Content-Type-Options: nosniff", async () => {
      const res = await request(port, "/app/index.html");
      assert.equal(res.headers["x-content-type-options"], "nosniff");
    });

    it("should include X-Frame-Options: DENY", async () => {
      const res = await request(port, "/app/index.html");
      assert.equal(res.headers["x-frame-options"], "DENY");
    });

    it("should include Referrer-Policy: strict-origin-when-cross-origin", async () => {
      const res = await request(port, "/app/index.html");
      assert.equal(
        res.headers["referrer-policy"],
        "strict-origin-when-cross-origin"
      );
    });

    it("should include Permissions-Policy: camera=(), microphone=(), geolocation=()", async () => {
      const res = await request(port, "/app/index.html");
      assert.equal(
        res.headers["permissions-policy"],
        "camera=(), microphone=(), geolocation=()"
      );
    });

    it("should not overwrite Content-Type", async () => {
      const res = await request(port, "/app/index.html");
      assert.equal(res.status, 200);
      assert.equal(res.headers["content-type"], "text/html");
    });
  });

  describe("404 response", () => {
    it("should include all 4 security headers", async () => {
      const res = await request(port, "/nonexistent-path");
      assert.equal(res.status, 404);
      for (const [header, value] of Object.entries(EXPECTED_HEADERS)) {
        assert.equal(res.headers[header], value, `${header} should be set`);
      }
    });
  });

  describe("403 response", () => {
    it("should include all 4 security headers", async () => {
      const res = await request(port, "/logs/access.jsonl");
      assert.equal(res.status, 403);
      for (const [header, value] of Object.entries(EXPECTED_HEADERS)) {
        assert.equal(res.headers[header], value, `${header} should be set`);
      }
    });
  });
});
