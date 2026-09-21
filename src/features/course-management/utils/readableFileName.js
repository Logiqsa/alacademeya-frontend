export const readableFileName = (value) => {
  if (typeof value !== "string" || !/[ØÙÃÂ]/.test(value)) return value;
  const bytes = Array.from(value, (character) => character.charCodeAt(0));
  if (bytes.some((byte) => byte > 255)) return value;
  try {
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bytes));
    return /[\u0600-\u06FF]/.test(decoded) ? decoded : value;
  } catch {
    return value;
  }
};
