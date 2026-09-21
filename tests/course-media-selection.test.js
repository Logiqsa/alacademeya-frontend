import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const form = readFileSync(new URL("../src/features/course-management/pages/TeacherCourseFormPage.jsx", import.meta.url), "utf8");
const uploadProgress = readFileSync(new URL("../src/features/course-management/components/CourseUploadProgress.jsx", import.meta.url), "utf8");
const notifications = readFileSync(new URL("../src/components/admin/notifications/NotificationsSection.jsx", import.meta.url), "utf8");

test("course files show their name and upload state with broad media selection", () => {
  assert.match(form, /normalizeSelectedFile/);
  assert.match(form, /تم الاختيار · ينتظر حفظ الدورة/);
  assert.match(form, /مرفوع/);
  assert.match(form, /video\/x-matroska/);
  assert.match(form, /audio\/webm/);
  assert.match(form, /image\/webp/);
  assert.match(form, /تم حفظ الدورة وإرسالها للمراجعة/);
  assert.match(form, /setCourse\(\(current\) => \(\{[\s\S]*?lessons: section\.lessons\.map/);
});

test("failed course uploads link back to the affected field or lesson", () => {
  assert.match(uploadProgress, /اذهب للمشكلة/);
  assert.match(uploadProgress, /onGoTo\(key, item\)/);
  assert.match(form, /goToUploadProblem/);
  assert.match(form, /setContentModal\(\{ sectionId: section\.id, lessonId: lesson\.id \}\)/);
  assert.match(form, /scrollIntoView\(\{ behavior: "smooth", block: "center" \}\)/);
});

test("course editor uses bounded responsive padding without negative step offsets", () => {
  assert.match(form, /max-w-\[1440px\]/);
  assert.match(form, /sm:p-6 lg:p-8 xl:p-10/);
  assert.doesNotMatch(form, /sm:-mt-8|lg:-mt-12/);
});

test("instructor notifications use the instructor label", () => {
  assert.match(notifications, /"محاضر", "instructor"/);
  assert.match(notifications, /teacher: "محاضر"/);
});

test("admin purchase notifications link the course title to its details page", () => {
  assert.match(notifications, /notificationCourse/);
  assert.match(notifications, /linkedText=\{course\.id \? course\.title/);
  assert.match(notifications, /`\/admin\/courses\/\$\{encodeURIComponent\(course\.id\)\}`/);
});
