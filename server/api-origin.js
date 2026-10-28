import process from "node:process";

export const DEFAULT_API_BASE_URL = "https://api.alacademeya.com/api";

// These server-side handlers do not receive Vite's import.meta.env. Honor the
// same build/runtime variable explicitly, while retaining the production URL
// as the safe default for deployed Vercel handlers.
export const resolveServerApiOrigin = (env = process.env) => {
  const value = env.VITE_API_BASE_URL || env.API_BASE_URL || DEFAULT_API_BASE_URL;
  try {
    const url = new URL(value);
    if (["http:", "https:"].includes(url.protocol)) return url.toString().replace(/\/+$/, "");
  } catch {
    // Fall through to the established production default.
  }
  return DEFAULT_API_BASE_URL;
};

export const SERVER_API_ORIGIN = resolveServerApiOrigin();
