import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import generatedShell from "../server/generated/spa-shell.js";
import { CACHE, resolveSpaDocument } from "../server/spa-shell.js";

const response = (status, payload, { malformed = false } = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => {
    if (malformed) throw new SyntaxError("invalid JSON");
    return payload;
  },
});
const course = { success: true, data: { id: "course-1", slug: "course-1" } };
const blog = { success: true, data: { blogPost: { id: "blog-1", slug: "blog-1" } } };

const resolve = (pathname, fetchImpl, options = {}) => resolveSpaDocument({
  pathname,
  shell: generatedShell,
  fetchImpl,
  timeoutMs: 15,
  ...options,
});

test("embedded shell is byte-for-byte the current Vite production shell", async () => {
  assert.equal(generatedShell, await readFile(new URL("../dist/index.html", import.meta.url), "utf8"));
  assert.match(generatedShell, /<div id="root"><\/div>/);
  assert.match(generatedShell, /\/assets\/index-[^"']+\.js/);
});

test("static and deterministic unknown routes return the same SPA shell", async () => {
  const known = await resolve("/login", () => { throw new Error("must not fetch"); });
  const unknown = await resolve("/random-invalid-url", () => { throw new Error("must not fetch"); });
  assert.equal(known.status, 200);
  assert.equal(unknown.status, 404);
  assert.equal(unknown.headers["Cache-Control"], CACHE.UNKNOWN);
  assert.equal(known.body, generatedShell);
  assert.equal(unknown.body, generatedShell);
});

for (const [label, pathname, foundPayload, expectedEndpoint] of [
  ["course", "/courses/course-1", course, "/courses/course-1"],
  ["blog", "/blog/blog-1", blog, "/blog-posts/public/blog-1"],
]) {
  test(`${label} validation maps authoritative backend statuses safely`, async () => {
    let requested = "";
    const found = await resolve(pathname, async (url) => {
      requested = url;
      return response(200, foundPayload);
    });
    assert.equal(new URL(requested).pathname, `/api${expectedEndpoint}`);
    assert.equal(found.status, 200);
    assert.equal(found.headers["Cache-Control"], CACHE.DYNAMIC_FOUND);

    for (const status of [404, 410]) {
      const missing = await resolve(pathname, async () => response(status));
      assert.equal(missing.status, 404);
      assert.equal(missing.headers["Cache-Control"], CACHE.DYNAMIC_MISSING);
      assert.equal(missing.body, generatedShell);
    }
    for (const status of [429, 500, 502, 503, 504]) {
      const uncertain = await resolve(pathname, async () => response(status));
      assert.equal(uncertain.status, 200);
      assert.equal(uncertain.headers["Cache-Control"], CACHE.NO_STORE);
    }
  });
}

test("network errors, malformed payloads, and timeouts fail open without caching", async () => {
  const failures = [
    async () => { throw new TypeError("network error"); },
    async () => response(200, null, { malformed: true }),
    async () => response(200, { success: true, data: null }),
    async (_url, { signal }) => new Promise((resolvePromise, reject) => {
      signal.addEventListener("abort", () => reject(signal.reason));
    }),
  ];
  for (const fetchImpl of failures) {
    const result = await resolve("/courses/course-1", fetchImpl);
    assert.equal(result.status, 200);
    assert.equal(result.headers["Cache-Control"], CACHE.NO_STORE);
  }
});

test("instructor routes remain deferred and never perform backend validation", async () => {
  let calls = 0;
  const result = await resolve("/instructors/some-id", async () => { calls += 1; });
  assert.equal(result.status, 200);
  assert.equal(calls, 0);
});

test("HEAD preserves classification and headers without a body", async () => {
  const found = await resolve("/blog/blog-1", async () => response(200, blog), { method: "HEAD" });
  const missing = await resolve("/blog/missing", async () => response(404), { method: "HEAD" });
  assert.equal(found.status, 200);
  assert.equal(missing.status, 404);
  assert.equal(found.body, "");
  assert.equal(missing.body, "");
});

test("excluded resources and unsupported methods are not owned by resolver logic", async () => {
  assert.equal((await resolve("/assets/app.js", async () => response(200))).owned, false);
  assert.equal((await resolve("/login", async () => response(200), { method: "POST" })).owned, false);
});

