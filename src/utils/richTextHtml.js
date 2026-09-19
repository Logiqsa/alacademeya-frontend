const HTML_TEXT_PATTERN = /<\/?(?:h[1-6]|p|ul|ol|li|strong|b|em|i|u|s|br|blockquote|a)(?:\s[^>]*)?>/i;
const ALLOWED_TAGS = new Set(["H1", "H2", "H3", "P", "UL", "OL", "LI", "STRONG", "B", "EM", "I", "U", "S", "BR", "BLOCKQUOTE", "A"]);

const repairReversedRtlTags = (value) => {
  let repaired = value;
  for (let pass = 0; pass < 3; pass += 1) {
    repaired = repaired.replace(
      /<(h[1-6]|p|li|strong|b|em|i|u|s|blockquote)\s*\/>([\s\S]*?)<\1\s*>/gi,
      "<$1>$2</$1>",
    );
    repaired = repaired.replace(/<ul\s*\/\s*>/gi, "</ul>").replace(/<ol\s*\/\s*>/gi, "</ol>");
  }
  return repaired;
};

const plainTextFallback = (value) => value
  .replace(/<\/?(?:h[1-6]|p|ul|ol|li|br|blockquote)(?:\s[^>]*)?>/gi, "\n")
  .replace(/<[^>]+>/g, "")
  .split(/\n+/)
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line, index) => {
    const node = index === 0 ? "h1" : /^\d+[.)،-]?\s/.test(line) ? "h2" : "p";
    return `<${node}>${line}</${node}>`;
  })
  .join("");

const sanitizeTree = (root) => {
  [...root.querySelectorAll("*")].forEach((element) => {
    if (!ALLOWED_TAGS.has(element.tagName)) {
      element.replaceWith(...element.childNodes);
      return;
    }

    [...element.attributes].forEach((attribute) => element.removeAttribute(attribute.name));
  });
};

export const normalizeRichTextHtml = (value) => {
  if (!value || typeof value !== "string" || typeof DOMParser === "undefined") return value || "";

  const current = new DOMParser().parseFromString(value, "text/html");
  const visibleText = current.body.textContent || "";
  const source = repairReversedRtlTags(HTML_TEXT_PATTERN.test(visibleText) ? visibleText : value);
  const normalized = new DOMParser().parseFromString(source, "text/html");
  sanitizeTree(normalized.body);
  if (HTML_TEXT_PATTERN.test(normalized.body.textContent || "")) {
    return plainTextFallback(normalized.body.textContent || "");
  }
  return normalized.body.innerHTML;
};
