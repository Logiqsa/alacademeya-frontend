import shell, { heroPreloadHref } from "../server/generated/spa-shell.js";
import { resolveSpaDocument } from "../server/spa-shell.js";

const requestPath = (request) => {
  const captured = Array.isArray(request.query?.path) ? request.query.path.join("/") : request.query?.path;
  if (captured !== undefined) return `/${String(captured).replace(/^\/+/, "")}`;
  return new URL(request.url || "/", "https://www.alacademeya.com").pathname;
};

export default async function handler(request, response) {
  const method = String(request.method || "GET").toUpperCase();
  const result = await resolveSpaDocument({ pathname: requestPath(request), method, shell, heroPreloadHref });
  if (!result.owned) {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Allow", "GET, HEAD");
    return response.status(result.reason === "method" ? 405 : 404).send("");
  }
  for (const [name, value] of Object.entries(result.headers)) response.setHeader(name, value);
  return response.status(result.status).send(result.body);
}
