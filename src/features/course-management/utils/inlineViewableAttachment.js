const inlineMimeTypes = new Set([
  "application/pdf",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const inlineExtensions = /\.(pdf|txt|png|jpe?g|webp)$/i;

export const isInlineViewableAttachment = (attachment) => {
  const mimeType = String(attachment?.file?.type || attachment?.mimeType || "").toLowerCase();
  if (mimeType) return inlineMimeTypes.has(mimeType);
  return inlineExtensions.test(String(attachment?.name || attachment?.originalName || ""));
};
