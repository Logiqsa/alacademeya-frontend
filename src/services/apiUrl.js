export const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL || "https://api.alacademeya.com/api"
).replace(/\/+$/, "");

export const API_ORIGIN = new URL(API_BASE_URL).origin;

// Use this for API endpoints. Unlike a URL beginning with `/`, it retains the
// configured API path (`/api`) and also accepts legacy paths prefixed with it.
export const resolveApiEndpoint = (path) => {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;

  const value = String(path).replace(/^\/+/, "").replace(/^api\/?/, "");
  return new URL(value, `${API_BASE_URL}/`).toString();
};

export const resolveApiUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return resolveApiEndpoint(url);
};

// Media ticket URLs remain ephemeral: this resolves the backend response only.
export const resolveMediaUrl = resolveApiUrl;
