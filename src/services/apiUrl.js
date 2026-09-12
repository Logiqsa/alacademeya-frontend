export const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL || "https://api.alacademeya.com/api"
).replace(/\/+$/, "");

export const API_ORIGIN = new URL(API_BASE_URL).origin;

export const resolveApiUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;

  const value = String(url);
  if (value.startsWith("/")) return new URL(value, API_ORIGIN).toString();
  return new URL(value.replace(/^\/+/, ""), `${API_BASE_URL}/`).toString();
};

// Media ticket URLs remain ephemeral: this resolves the backend response only.
export const resolveMediaUrl = resolveApiUrl;
