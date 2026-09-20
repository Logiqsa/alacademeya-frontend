import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { classifySpaPath, SPA_ROUTE_KIND } from "../server/spa-routes.js";

const expectKind = (paths, kind) => {
  for (const path of paths) assert.equal(classifySpaPath(path).kind, kind, path);
};

test("real static application routes are SPA eligible", () => {
  expectKind([
    "/", "/courses", "/blogs", "/login", "/register",
    "/student-dashboard", "/teacher-dashboard", "/admin-dashboard",
    "/policies/instructor-agreement",
  ], SPA_ROUTE_KIND.STATIC_APP_ROUTE);
});

test("classifier recognizes every active path declared by App.jsx", async () => {
  const source = (await readFile(new URL("../src/App.jsx", import.meta.url), "utf8"))
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  const declared = [...source.matchAll(/<Route\s+path="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((path) => path !== "*");
  assert.ok(declared.length > 80, "route inventory extraction unexpectedly found too few routes");
  for (const template of declared) {
    const example = template.replace(/:[^/]+/g, "example");
    assert.notEqual(classifySpaPath(example).kind, SPA_ROUTE_KIND.UNKNOWN, template);
  }
});

test("registered parameterized and protected routes are SPA eligible", () => {
  expectKind([
    "/student/groups/group-1/lessons/lesson-1/files",
    "/teacher/courses/course-1/quizzes/lesson-1",
    "/parent/classrooms/room-1/sessions/session-1",
    "/admin/subscriptions/request-1/renew",
    "/payment/courses/course-1",
    "/subscription-orders/order-1/status",
  ], SPA_ROUTE_KIND.STATIC_APP_ROUTE);
});

test("public entity patterns are classified separately", () => {
  assert.deepEqual(classifySpaPath("/courses/arabic%20course/"), {
    kind: SPA_ROUTE_KIND.DYNAMIC_COURSE,
    path: "/courses/arabic%20course",
    parameter: "arabic course",
  });
  expectKind(["/blog/an-article"], SPA_ROUTE_KIND.DYNAMIC_BLOG);
  expectKind(["/instructors/some-id"], SPA_ROUTE_KIND.DYNAMIC_INSTRUCTOR);
});

test("unknown paths do not pass through broad substring or namespace checks", () => {
  expectKind([
    "/random-invalid-url", "/courses/a/b", "/blog", "/policies/not-real",
    "/admin", "/administrator/users", "/student/not-a-route",
  ], SPA_ROUTE_KIND.UNKNOWN);
});

test("assets and infrastructure paths are excluded", () => {
  expectKind([
    "/assets/app.js", "/favicon.ico", "/robots.txt", "/sitemap.xml",
    "/sitemaps/courses.xml", "/api/sitemap", "/images/photo.webp",
    "/fonts/site.woff2", "/manifest.webmanifest", "/index.html",
  ], SPA_ROUTE_KIND.EXCLUDED);
});
