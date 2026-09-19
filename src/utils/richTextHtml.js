const HTML_TEXT_PATTERN = /<\/?(?:h[1-6]|p|ul|ol|li|strong|b|em|i|u|s|br|blockquote|a)(?:\s[^>]*)?>/i;
const ALLOWED_TAGS = new Set(["H1", "H2", "H3", "P", "UL", "OL", "LI", "STRONG", "B", "EM", "I", "U", "S", "BR", "BLOCKQUOTE", "A"]);

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
  const source = HTML_TEXT_PATTERN.test(visibleText) ? visibleText : value;
  const normalized = new DOMParser().parseFromString(source, "text/html");
  sanitizeTree(normalized.body);
  return normalized.body.innerHTML;
};
