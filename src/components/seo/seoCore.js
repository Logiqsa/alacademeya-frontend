export const SITE_NAME = "الأكاديمية";
export const SITE_URL = (import.meta.env?.VITE_SITE_URL || "https://www.alacademeya.com").replace(/\/$/, "");
export const DEFAULT_DESCRIPTION =
  "منصة تعليمية متكاملة للدورات والحصص والاختبارات وإدارة رحلة التعلم.";
const TRACKING_PARAMETERS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "fbclid", "gclid",
]);

const upsertMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
};

const absoluteUrl = (value) => {
  if (!value) return undefined;
  try { return new URL(value, SITE_URL).toString(); } catch { return undefined; }
};

export const cleanDescription = (value, fallback = DEFAULT_DESCRIPTION) => {
  const text = String(value || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
  return (text || fallback).slice(0, 180);
};

export const canonicalUrlFor = (value = "/") => {
  const requested = new URL(value || "/", SITE_URL);
  const canonical = new URL(requested.pathname, SITE_URL);
  if (canonical.pathname !== "/") canonical.pathname = canonical.pathname.replace(/\/+$/, "");
  requested.searchParams.forEach((parameterValue, parameterName) => {
    if (!TRACKING_PARAMETERS.has(parameterName.toLowerCase())) {
      canonical.searchParams.append(parameterName, parameterValue);
    }
  });
  return canonical.toString();
};

export function applySeo({ title, description = DEFAULT_DESCRIPTION, path = window.location.pathname, image, type = "website", noindex = false, lang = "ar", structuredData }) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | منصة تعليمية متكاملة`;
  const canonical = canonicalUrlFor(path);
  const summary = cleanDescription(description);
  const socialImage = absoluteUrl(image);
  document.title = pageTitle;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  upsertMeta('meta[name="description"]', { name: "description", content: summary });
  upsertMeta('meta[name="robots"]', { name: "robots", content: noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large" });
  upsertMeta('meta[property="og:title"]', { property: "og:title", content: pageTitle });
  upsertMeta('meta[property="og:description"]', { property: "og:description", content: summary });
  upsertMeta('meta[property="og:type"]', { property: "og:type", content: type });
  upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
  upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: SITE_NAME });
  upsertMeta('meta[property="og:locale"]', { property: "og:locale", content: lang === "ar" ? "ar_AR" : "en_US" });
  upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: socialImage ? "summary_large_image" : "summary" });
  upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: pageTitle });
  upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: summary });
  let canonicalElement = document.head.querySelector('link[rel="canonical"]');
  if (!canonicalElement) { canonicalElement = document.createElement("link"); canonicalElement.rel = "canonical"; document.head.appendChild(canonicalElement); }
  canonicalElement.href = canonical;
  document.head.querySelectorAll('[data-seo-optional="true"]').forEach((element) => element.remove());
  if (socialImage) {
    [["property", "og:image"], ["name", "twitter:image"]].forEach(([attribute, value]) => {
      const element = document.createElement("meta"); element.setAttribute(attribute, value); element.content = socialImage; element.dataset.seoOptional = "true"; document.head.appendChild(element);
    });
  }
  if (structuredData) {
    const script = document.createElement("script"); script.type = "application/ld+json"; script.dataset.seoOptional = "true"; script.textContent = JSON.stringify(structuredData); document.head.appendChild(script);
  }
}
