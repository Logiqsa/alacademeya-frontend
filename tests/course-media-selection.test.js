import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const form = readFileSync(new URL("../src/features/course-management/pages/TeacherCourseFormPage.jsx", import.meta.url), "utf8");
const uploadProgress = readFileSync(new URL("../src/features/course-management/components/CourseUploadProgress.jsx", import.meta.url), "utf8");
const uploadError = readFileSync(new URL("../src/features/course-management/utils/uploadErrorMessage.js", import.meta.url), "utf8");
const coursesApi = readFileSync(new URL("../src/features/course-management/api/coursesApi.js", import.meta.url), "utf8");
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

test("course sections collapse without removing lessons and reopen for upload errors", () => {
  assert.match(form, /collapsedSectionIds/);
  assert.match(form, /aria-expanded=\{!isCollapsed\}/);
  assert.match(form, /hidden=\{isCollapsed\}/);
  assert.match(form, /setCollapsedSectionIds\(\(current\) => \{/);
  assert.match(form, /next\.delete\(sectionId\)/);
});

test("protected-file rejection explains the server response in Arabic", () => {
  assert.match(uploadError, /protected file content or type is not allowed/i);
  assert.match(uploadError, /الخادم رفض نوع الملف أو محتواه/);
});

test("attachments upload separately and a removed file cannot retry from stale state", () => {
  assert.match(coursesApi, /for \(const attachment of newAttachments\)/);
  assert.match(coursesApi, /\[attachmentFile\], accessMode/);
  assert.match(coursesApi, /error\.uploadFileName = attachmentFile\.name/);
  assert.match(form, /cancelRetryForFileChange\(\)/);
  assert.match(form, /retryRequestRef\.current\.cancel\(\)/);
  assert.match(uploadProgress, /attachment:\$\{lesson\.id\}/);
  assert.match(form, /حفظ الدورة والملفات/);
  assert.match(form, /const isMediaAttachment/);
  assert.match(form, /selected\.filter\(\(file\) => !isMediaAttachment\(file\)\)/);
  assert.match(form, /اختره كمحتوى أساسي للدرس/);
  assert.match(form, /فشل رفع هذا الملف/);
  assert.match(form, /تم حفظ الدورة والملفات بنجاح/);
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
