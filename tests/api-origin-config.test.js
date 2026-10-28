import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DEFAULT_API_BASE_URL, resolveServerApiOrigin } from "../server/api-origin.js";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("frontend API consumers use the shared configurable origin", () => {
  const apiUrl = read("src/services/apiUrl.js");
  const chatApi = read("src/api/chatApi.js");
  const socket = read("src/api/socket.js");
  const usersTable = read("src/components/admin/users/Userstable.jsx");
  const certificate = read("src/features/course-management/pages/student/CertificatePage.jsx");
  const serverApiOrigin = read("server/api-origin.js");
  const spaShell = read("server/spa-shell.js");
  const sitemap = read("server/sitemap.js");

  assert.match(apiUrl, /VITE_API_BASE_URL/);
  assert.match(apiUrl, /export const resolveApiEndpoint/);
  assert.match(apiUrl, /replace\(\/\^api\\?\//);
  assert.match(chatApi, /import \{ API_BASE_URL \} from "\.\.\/services\/apiUrl"/);
  assert.match(chatApi, /baseURL: API_BASE_URL/);
  assert.match(socket, /import \{ API_ORIGIN \} from "\.\.\/services\/apiUrl"/);
  assert.match(socket, /io\(API_ORIGIN/);
  assert.match(socket, /path: "\/socket\.io"/);
  assert.match(usersTable, /resolveApiEndpoint\(/);
  assert.match(certificate, /resolveApiEndpoint\(`certificates\/verify/);
  assert.match(serverApiOrigin, /VITE_API_BASE_URL/);
  assert.match(serverApiOrigin, /API_BASE_URL/);
  assert.match(spaShell, /SERVER_API_ORIGIN/);
  assert.match(sitemap, /SERVER_API_ORIGIN/);

  for (const source of [chatApi, socket, usersTable, certificate]) {
    assert.doesNotMatch(source, /https:\/\/api\.alacademeya\.com/);
  }
});

test("only configuration and server-rendering files retain production defaults", () => {
  const sourceFiles = [
    "src/api/chatApi.js",
    "src/api/socket.js",
    "src/components/admin/users/Userstable.jsx",
    "src/features/course-management/pages/student/CertificatePage.jsx",
  ];

  for (const sourceFile of sourceFiles) {
    assert.doesNotMatch(read(sourceFile), /https:\/\/api\.alacademeya\.com/);
  }
});

test("server-side API consumers honor the configured origin and reject invalid values", () => {
  assert.equal(
    resolveServerApiOrigin({ VITE_API_BASE_URL: "http://127.0.0.1:30120/api/" }),
    "http://127.0.0.1:30120/api",
  );
  assert.equal(
    resolveServerApiOrigin({ API_BASE_URL: "https://preview.example.com/api" }),
    "https://preview.example.com/api",
  );
  assert.equal(resolveServerApiOrigin({ VITE_API_BASE_URL: "javascript:alert(1)" }), DEFAULT_API_BASE_URL);
});
