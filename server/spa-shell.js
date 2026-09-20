import { classifySpaPath, SPA_ROUTE_KIND } from "./spa-routes.js";

export const API_ORIGIN = "https://api.alacademeya.com/api";
export const ENTITY_TIMEOUT_MS = 5_000;

export const CACHE = Object.freeze({
  DYNAMIC_FOUND: "public, s-maxage=300, stale-while-revalidate=900",
  DYNAMIC_MISSING: "public, s-maxage=30",
  UNKNOWN: "public, s-maxage=3600",
  NO_STORE: "no-store",
});

const validators = {
  [SPA_ROUTE_KIND.DYNAMIC_COURSE]: {
    endpoint: (slug) => `/courses/${encodeURIComponent(slug)}`,
    validPayload: (payload) => payload?.success === true
      && payload?.data
      && typeof payload.data === "object"
      && Boolean(payload.data._id || payload.data.id)
      && typeof payload.data.slug === "string",
  },
  [SPA_ROUTE_KIND.DYNAMIC_BLOG]: {
    endpoint: (slug) => `/blog-posts/public/${encodeURIComponent(slug)}`,
    validPayload: (payload) => payload?.success === true
      && payload?.data?.blogPost
      && typeof payload.data.blogPost === "object"
      && Boolean(payload.data.blogPost._id || payload.data.blogPost.id)
      && typeof payload.data.blogPost.slug === "string",
  },
};

const validateEntity = async (route, { fetchImpl, apiOrigin, timeoutMs }) => {
  const validator = validators[route.kind];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`${apiOrigin.replace(/\/$/, "")}${validator.endpoint(route.parameter)}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (response.status === 404 || response.status === 410) return "missing";
    if (!response.ok) return "indeterminate";
    let payload;
    try {
      payload = await response.json();
    } catch {
      return "indeterminate";
    }
    return validator.validPayload(payload) ? "found" : "indeterminate";
  } catch {
    return "indeterminate";
  } finally {
    clearTimeout(timeout);
  }
};

const documentResult = (shell, method, status, cacheControl) => ({
  owned: true,
  status,
  headers: {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": cacheControl,
  },
  body: method === "HEAD" ? "" : shell,
});

export const resolveSpaDocument = async ({
  pathname,
  method = "GET",
  shell,
  fetchImpl = fetch,
  apiOrigin = API_ORIGIN,
  timeoutMs = ENTITY_TIMEOUT_MS,
}) => {
  const normalizedMethod = String(method).toUpperCase();
  if (normalizedMethod !== "GET" && normalizedMethod !== "HEAD") {
    return { owned: false, reason: "method" };
  }
  const route = classifySpaPath(pathname);
  if (route.kind === SPA_ROUTE_KIND.EXCLUDED) return { owned: false, reason: "excluded", route };
  if (route.kind === SPA_ROUTE_KIND.UNKNOWN) {
    return documentResult(shell, normalizedMethod, 404, CACHE.UNKNOWN);
  }
  if (route.kind === SPA_ROUTE_KIND.DYNAMIC_INSTRUCTOR || route.kind === SPA_ROUTE_KIND.STATIC_APP_ROUTE) {
    return documentResult(shell, normalizedMethod, 200, CACHE.DYNAMIC_FOUND);
  }
  const validation = await validateEntity(route, { fetchImpl, apiOrigin, timeoutMs });
  if (validation === "missing") return documentResult(shell, normalizedMethod, 404, CACHE.DYNAMIC_MISSING);
  if (validation === "indeterminate") return documentResult(shell, normalizedMethod, 200, CACHE.NO_STORE);
  return documentResult(shell, normalizedMethod, 200, CACHE.DYNAMIC_FOUND);
};
