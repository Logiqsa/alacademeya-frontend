import { STATIC_INDEXABLE_PATHS } from "../src/components/seo/seoRoutes.js";

export const SITE_ORIGIN = "https://www.alacademeya.com";
export const API_ORIGIN = "https://api.alacademeya.com/api";
export const SITEMAP_LIMIT = 50_000;
export const FEED_PAGE_SIZE = 1_000;
export const MAX_FEED_ITERATIONS = 100;
export const REQUEST_TIMEOUT_MS = 8_000;

const FEEDS = Object.freeze({
  courses: { endpoint: "/seo/sitemap-data/courses", publicPath: "/courses" },
  blogs: { endpoint: "/seo/sitemap-data/blogs", publicPath: "/blog" },
});

export const escapeXml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

export const encodePathSegment = (value) => {
  const text = String(value);
  try {
    return encodeURIComponent(decodeURIComponent(text));
  } catch {
    return encodeURIComponent(text);
  }
};

const urlsetXml = (urls) => {
  if (urls.length > SITEMAP_LIMIT) {
    throw new Error(`SITEMAP_URL_LIMIT_EXCEEDED:${urls.length}`);
  }
  const entries = urls.map((url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
};

export const sitemapIndexXml = () => {
  const paths = ["/sitemaps/pages.xml", "/sitemaps/courses.xml", "/sitemaps/blogs.xml"];
  const entries = paths.map((path) => `  <sitemap>\n    <loc>${escapeXml(`${SITE_ORIGIN}${path}`)}</loc>\n  </sitemap>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;
};

export const pagesSitemapXml = () => urlsetXml(
  STATIC_INDEXABLE_PATHS.map((path) => `${SITE_ORIGIN}${path === "/" ? "/" : path}`),
);

const validatePage = (payload) => {
  if (!payload || payload.success !== true || !Array.isArray(payload.data)) {
    throw new Error("SITEMAP_FEED_INVALID_RESPONSE");
  }
  const pagination = payload.pagination;
  if (
    !pagination ||
    !Number.isInteger(pagination.limit) ||
    pagination.limit < 1 ||
    pagination.limit > FEED_PAGE_SIZE ||
    typeof pagination.hasMore !== "boolean" ||
    !("nextCursor" in pagination)
  ) {
    throw new Error("SITEMAP_FEED_INVALID_PAGINATION");
  }
  if (pagination.hasMore && !/^[a-f\d]{24}$/i.test(String(pagination.nextCursor || ""))) {
    throw new Error("SITEMAP_FEED_INVALID_CURSOR");
  }
  return { entries: payload.data, hasMore: pagination.hasMore, nextCursor: pagination.nextCursor };
};

const fetchJson = async (url, { fetchImpl, timeoutMs }) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    if (!response?.ok) throw new Error(`SITEMAP_FEED_HTTP_${response?.status || "ERROR"}`);
    try {
      return await response.json();
    } catch {
      throw new Error("SITEMAP_FEED_INVALID_JSON");
    }
  } finally {
    clearTimeout(timeout);
  }
};

export const collectFeedUrls = async (feedName, {
  fetchImpl = fetch,
  apiOrigin = API_ORIGIN,
  pageSize = FEED_PAGE_SIZE,
  maxIterations = MAX_FEED_ITERATIONS,
  timeoutMs = REQUEST_TIMEOUT_MS,
  urlLimit = SITEMAP_LIMIT,
} = {}) => {
  const feed = FEEDS[feedName];
  if (!feed) throw new Error("SITEMAP_FEED_UNKNOWN");
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > FEED_PAGE_SIZE) {
    throw new Error("SITEMAP_FEED_INVALID_PAGE_SIZE");
  }
  const urls = new Set();
  const seenCursors = new Set();
  let cursor = null;

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    const requestUrl = new URL(`${apiOrigin.replace(/\/$/, "")}${feed.endpoint}`);
    requestUrl.searchParams.set("limit", String(pageSize));
    if (cursor) requestUrl.searchParams.set("cursor", cursor);
    const page = validatePage(await fetchJson(requestUrl, { fetchImpl, timeoutMs }));

    for (const entry of page.entries) {
      if (!entry || typeof entry.slug !== "string") continue;
      const slug = entry.slug.trim();
      if (!slug || slug === "." || slug === ".." || /[\\/]/.test(slug)) continue;
      urls.add(`${SITE_ORIGIN}${feed.publicPath}/${encodePathSegment(slug)}`);
      if (urls.size > urlLimit) throw new Error(`SITEMAP_URL_LIMIT_EXCEEDED:${urls.size}`);
    }

    if (!page.hasMore) return [...urls];
    const nextCursor = String(page.nextCursor);
    if (seenCursors.has(nextCursor)) throw new Error("SITEMAP_FEED_REPEATED_CURSOR");
    seenCursors.add(nextCursor);
    cursor = nextCursor;
  }
  throw new Error("SITEMAP_FEED_ITERATION_LIMIT");
};

export const dynamicSitemapXml = async (feedName, options) =>
  urlsetXml(await collectFeedUrls(feedName, options));
