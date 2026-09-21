import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("published instructors can create and continue a reviewed course revision", () => {
  const api = read("src/services/APIService.js");
  const details = read("src/features/course-management/pages/TeacherCourseDetailsPage.jsx");
  assert.match(api, /POST|\.post\(`\/courses\/me\/\$\{id\}\/revision`\)/i);
  assert.match(details, /تحديث الدورة والمنهج/);
  assert.match(details, /متابعة تعديل المنهج/);
});

test("revision editing explains learner safety and admin approval is revision-aware", () => {
  const form = read("src/features/course-management/pages/TeacherCourseFormPage.jsx");
  const admin = read("src/features/course-management/pages/AdminCourseDetailsPage.jsx");
  assert.match(form, /لن تظهر التغييرات للمتعلمين إلا بعد موافقة الإدارة/);
  assert.match(form, /disabled=\{Boolean\(existingCourse\?\.revisionOf && lesson\.originId\)\}/);
  assert.match(admin, /اعتماد التحديث/);
  assert.match(admin, /نسخة تحديث لمنهج دورة منشورة/);
});
