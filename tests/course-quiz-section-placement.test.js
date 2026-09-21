import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { Buffer } from "node:buffer";
import { placeCourseQuizzes } from "../src/features/course-management/utils/placeCourseQuizzes.js";
import { courseStatusStyles } from "../src/features/course-management/utils/courseStatusStyles.js";
import { readableFileName } from "../src/features/course-management/utils/readableFileName.js";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const form = read("../src/features/course-management/pages/TeacherCourseFormPage.jsx");
const details = read("../src/features/course-management/pages/TeacherCourseDetailsPage.jsx");
const adminDetails = read("../src/features/course-management/pages/AdminCourseDetailsPage.jsx");
const api = read("../src/features/course-management/api/coursesApi.js");

test("quizzes follow the lesson linked to their section", () => {
  const sections = [
    { id: "first", lessons: [{ id: "lesson-1" }] },
    { id: "second", lessons: [{ id: "lesson-2" }] },
  ];
  const placed = placeCourseQuizzes(sections, [{ id: "quiz-2", lesson: { _id: "lesson-2" } }]);
  assert.equal(placed[0].lessons.length, 1);
  assert.equal(placed[1].lessons[1].id, "quiz-2");
  assert.equal(placed[1].lessons[1]._sectionUnlinked, false);
  assert.equal(sections[1].lessons.length, 1);
});

test("older unlinked quizzes are clearly flagged instead of silently presented as linked", () => {
  const placed = placeCourseQuizzes([{ id: "first", lessons: [] }], [{ id: "old-quiz" }]);
  assert.equal(placed[0].lessons[0]._sectionUnlinked, true);
  assert.match(form, /مكان هذا الاختبار غير محدد/);
  assert.match(details, /اختبار غير مرتبط بقسم/);
  assert.match(adminDetails, /اختبار غير مرتبط بقسم/);
});

test("admin and instructor use the same quiz section placement", () => {
  assert.match(details, /placeCourseQuizzes\(course\.curriculum, course\.quizzes/);
  assert.match(adminDetails, /placeCourseQuizzes\(reviewCurriculum, course\.quizzes/);
  assert.doesNotMatch(adminDetails, /curriculumWithQuizzes\[0\]\.lessons\.push/);
});

test("legacy Arabic filenames display correctly without changing valid names", () => {
  const arabicName = "اختبار القسم الثاني.mp3";
  assert.equal(readableFileName(Buffer.from(arabicName, "utf8").toString("latin1")), arabicName);
  assert.equal(readableFileName(arabicName), arabicName);
  assert.equal(readableFileName("course-video.mp4"), "course-video.mp4");
});

test("course steps are clickable and old quiz warning stays outside the lesson grid", () => {
  const navigation = read("../src/features/course-management/components/CourseStepsNavigation.jsx");
  assert.match(navigation, /onStepChange\?\.\(step\.id\)/);
  assert.match(form, /onStepChange=\{\(stepId\)/);
  assert.match(form, /<\/div>\s*\{lesson\._sectionUnlinked && lesson\.type === "اختبار"/);
});

test("save anchors quizzes after regular lessons and submits teacher edits for review", () => {
  assert.match(api, /lesson: orderedLessonIds\[0\] \|\| null/);
  assert.match(api, /section\.lessons\[left\]\.type === 'اختبار'/);
  assert.match(form, /save\(isAdminFlow \? course\.status : "قيد المراجعة"\)/);
  assert.match(form, /بعد اكتمال حفظ الدورة والملفات ستُرسل تلقائيًا للمراجعة/);
});

test("teacher course list and details share the same status badge palette", () => {
  assert.equal(courseStatusStyles["مسودة"], "bg-[#E5E7EB] text-[#667085]");
  assert.match(details, /courseStatusStyles\[course\.status\]/);
  assert.match(read("../src/features/course-management/pages/TeacherCoursesPage.jsx"), /courseStatusStyles\[course\.status\]/);
});

test("draft submission lives on course details, separate from editing", () => {
  assert.match(details, /إرسال للمراجعة/);
  assert.match(details, /submitMarketplaceCourse\(course\.id\)/);
  assert.match(details, /PolicyAcceptanceDialog/);
  assert.match(details, /confirmToast/);
  assert.match(details, /disabled=\{submitting\}/);
});

test("admin and instructor can open lesson attachments from course details", () => {
  assert.match(adminDetails, /requestLessonAttachmentAccess\(course\.id, lessonId, attachmentId\)/);
  assert.match(adminDetails, /onClick=\{\(\) => openAttachment\(lesson, attachment\)\}/);
  assert.match(details, /requestLessonAttachmentAccess\(course\.id, lessonId, attachmentId\)/);
  assert.match(details, /onClick=\{\(\) => openProtectedResource\(\{ lesson, attachment \}\)\}/);
});
