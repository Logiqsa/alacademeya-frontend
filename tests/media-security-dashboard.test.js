import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page = fs.readFileSync("src/pages/admin/MediaSecurityEventsPage.jsx", "utf8");
const app = fs.readFileSync("src/App.jsx", "utf8");
const sidebar = fs.readFileSync("src/components/admin/layout/AdminSidebar.jsx", "utf8");

test("admin media-security dashboard renders monitoring states, filters, attempts, and trusted-role badges", () => {
  for (const value of ["getAdminMediaSecurityEvents", "attemptCount", "minAttempts", "كل الأدوار", "لا يوجد نشاط مطابق", "تعذر تحميل", "إعادة المحاولة", "اختبار", "محاضر"]) {
    assert.match(page, new RegExp(value));
  }
  assert.match(page, /setPage/);
});

test("media-security page is reachable only inside the existing AdminGuard route group", () => {
  const guardStart = app.indexOf('<Route element={<AdminGuard />}>');
  const securityRoute = app.indexOf('path="/admin/security/media"');
  assert.ok(guardStart >= 0 && securityRoute > guardStart);
  assert.match(sidebar, /\/admin\/security\/media/);
});
