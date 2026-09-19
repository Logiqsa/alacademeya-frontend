import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const form = readFileSync(new URL("../src/features/course-management/pages/TeacherCourseFormPage.jsx", import.meta.url), "utf8");
const notifications = readFileSync(new URL("../src/components/admin/notifications/NotificationsSection.jsx", import.meta.url), "utf8");

test("course files show their name and upload state with broad media selection", () => {
  assert.match(form, /normalizeSelectedFile/);
  assert.match(form, /تم الاختيار · ينتظر حفظ الدورة/);
  assert.match(form, /مرفوع/);
  assert.match(form, /video\/x-matroska/);
  assert.match(form, /audio\/webm/);
  assert.match(form, /image\/webp/);
  assert.match(form, /تم حفظ الدورة وإرسالها للمراجعة/);
});

test("instructor notifications use the instructor label", () => {
  assert.match(notifications, /"محاضر", "instructor"/);
  assert.match(notifications, /teacher: "محاضر"/);
});
