import assert from "node:assert/strict";
import test from "node:test";
import handler from "../api/sitemap.js";
import {
  collectFeedUrls,
  dynamicSitemapXml,
  escapeXml,
  pagesSitemapXml,
  SITE_ORIGIN,
  sitemapIndexXml,
} from "../server/sitemap.js";

const CURSOR_A = "64b000000000000000000001";
const CURSOR_B = "64b000000000000000000002";
const response = (payload, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => payload,
});
const page = (data, { hasMore = false, nextCursor = null } = {}) => ({
  success: true,
  data,
  pagination: { limit: 1000, hasMore, nextCursor },
});
const sequentialFetch = (responses, requested = []) => async (url) => {
  requested.push(String(url));
  if (!responses.length) throw new Error("Unexpected fetch");
  return responses.shift();
};

const mockHttpResponse = () => ({
  headers: {}, statusCode: 0, body: "",
  setHeader(name, value) { this.headers[name] = value; },
  status(code) { this.statusCode = code; return this; },
  send(body) { this.body = body; return this; },
});

test("sitemap index is valid and contains exactly the three canonical children", () => {
  const xml = sitemapIndexXml();
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.equal((xml.match(/<sitemap>/g) || []).length, 3);
  assert.deepEqual([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]), [
    `${SITE_ORIGIN}/sitemaps/pages.xml`,
    `${SITE_ORIGIN}/sitemaps/courses.xml`,
    `${SITE_ORIGIN}/sitemaps/blogs.xml`,
  ]);
  assert.doesNotMatch(xml, /<lastmod>/);
});

test("pages sitemap follows the existing public static indexation policy", () => {
  const xml = pagesSitemapXml();
  for (const path of ["/", "/courses", "/blogs", "/policies/instructor-agreement", "/policies/course-publishing", "/policies/revenue-share", "/policies/course-terms"]) {
    assert.match(xml, new RegExp(`<loc>${escapeXml(`${SITE_ORIGIN}${path}`)}</loc>`));
  }
  for (const path of ["/login", "/register", "/admin", "/learner-dashboard", "/certificates/verify", "/payment/success"]) {
    assert.doesNotMatch(xml, new RegExp(`<loc>${escapeXml(`${SITE_ORIGIN}${path}`)}</loc>`));
  }
  assert.equal((xml.match(/<url>/g) || []).length, 7);
});

test("course feed exhausts cursors, encodes slugs, skips invalid entries, and deduplicates", async () => {
  const requested = [];
  const fetchImpl = sequentialFetch([
    response(page([{ slug: "course-one" }, { slug: "دورة عربية" }, { slug: "already%20encoded" }, { slug: "" }, { slug: "bad/path" }, null], { hasMore: true, nextCursor: CURSOR_A })),
    response(page([{ slug: "course-one" }, { slug: "a&b" }])),
  ], requested);
  const urls = await collectFeedUrls("courses", { fetchImpl });
  assert.deepEqual(urls, [
    `${SITE_ORIGIN}/courses/course-one`,
    `${SITE_ORIGIN}/courses/${encodeURIComponent("دورة عربية")}`,
    `${SITE_ORIGIN}/courses/already%20encoded`,
    `${SITE_ORIGIN}/courses/a%26b`,
  ]);
  assert.equal(new URL(requested[0]).searchParams.get("limit"), "1000");
  assert.equal(new URL(requested[0]).searchParams.has("cursor"), false);
  assert.equal(new URL(requested[1]).searchParams.get("cursor"), CURSOR_A);
});

test("blog feed generates escaped valid XML without lastmod", async () => {
  const xml = await dynamicSitemapXml("blogs", {
    fetchImpl: sequentialFetch([response(page([{ slug: "خبر-جديد" }, { slug: "tips&tricks" }]))]),
  });
  assert.match(xml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  assert.match(xml, new RegExp(encodeURIComponent("خبر-جديد")));
  assert.match(xml, /tips%26tricks/);
  assert.doesNotMatch(xml, /<lastmod>/);
  assert.equal(escapeXml(`&<>"'`), "&amp;&lt;&gt;&quot;&apos;");
});

test("feed failures and malformed pagination reject instead of returning an empty sitemap", async () => {
  await assert.rejects(
    collectFeedUrls("courses", { fetchImpl: sequentialFetch([response({}, 503)]) }),
    /SITEMAP_FEED_HTTP_503/,
  );
  await assert.rejects(
    collectFeedUrls("blogs", { fetchImpl: sequentialFetch([response({ success: true, data: [], pagination: {} })]) }),
    /SITEMAP_FEED_INVALID_PAGINATION/,
  );
});

test("repeated cursors and defensive iteration limits are detected", async () => {
  await assert.rejects(
    collectFeedUrls("courses", { fetchImpl: sequentialFetch([
      response(page([], { hasMore: true, nextCursor: CURSOR_A })),
      response(page([], { hasMore: true, nextCursor: CURSOR_A })),
    ]) }),
    /SITEMAP_FEED_REPEATED_CURSOR/,
  );
  await assert.rejects(
    collectFeedUrls("blogs", {
      maxIterations: 2,
      fetchImpl: sequentialFetch([
        response(page([], { hasMore: true, nextCursor: CURSOR_A })),
        response(page([], { hasMore: true, nextCursor: CURSOR_B })),
      ]),
    }),
    /SITEMAP_FEED_ITERATION_LIMIT/,
  );
});

test("URL limit throws and never silently truncates", async () => {
  await assert.rejects(
    collectFeedUrls("courses", {
      urlLimit: 1,
      fetchImpl: sequentialFetch([response(page([{ slug: "one" }, { slug: "two" }]))]),
    }),
    /SITEMAP_URL_LIMIT_EXCEEDED:2/,
  );
});

test("HTTP handler sends XML and CDN cache headers", async () => {
  const result = mockHttpResponse();
  await handler({ query: { type: "index" } }, result);
  assert.equal(result.statusCode, 200);
  assert.equal(result.headers["Content-Type"], "application/xml; charset=utf-8");
  assert.equal(result.headers["Cache-Control"], "public, s-maxage=3600, stale-while-revalidate=86400");
  assert.match(result.body, /<sitemapindex/);
});

test("HTTP handler returns a non-cacheable server error when a feed fails", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => response({}, 503);
  try {
    const result = mockHttpResponse();
    await handler({ query: { type: "courses" } }, result);
    assert.equal(result.statusCode, 502);
    assert.equal(result.headers["Cache-Control"], "no-store");
    assert.doesNotMatch(result.body, /<urlset/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
