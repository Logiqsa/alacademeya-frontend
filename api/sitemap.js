import { dynamicSitemapXml, pagesSitemapXml, sitemapIndexXml } from "../server/sitemap.js";

const CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=86400";

export default async function handler(request, response) {
  const type = Array.isArray(request.query?.type) ? request.query.type[0] : request.query?.type;
  try {
    const xml = type === "index"
      ? sitemapIndexXml()
      : type === "pages"
        ? pagesSitemapXml()
        : type === "courses" || type === "blogs"
          ? await dynamicSitemapXml(type)
          : null;
    if (!xml) {
      response.setHeader("Cache-Control", "no-store");
      return response.status(404).send("Sitemap not found");
    }
    response.setHeader("Content-Type", "application/xml; charset=utf-8");
    response.setHeader("Cache-Control", CACHE_CONTROL);
    return response.status(200).send(xml);
  } catch (error) {
    console.error("Sitemap generation failed", error);
    response.setHeader("Cache-Control", "no-store");
    return response.status(502).send("Sitemap temporarily unavailable");
  }
}
