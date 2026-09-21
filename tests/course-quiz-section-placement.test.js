import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { placeCourseQuizzes } from "../src/features/course-management/utils/placeCourseQuizzes.js";
import { courseStatusStyles } from "../src/features/course-management/utils/courseStatusStyles.js";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const form = read("../src/features/course-management/pages/TeacherCourseFormPage.jsx");
const details = read("../src/features/course-management/pages/TeacherCourseDetailsPage.jsx");
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
  assert.match(form, /غير مرتبط بقسم/);
  assert.match(details, /اختبار غير مرتبط بقسم/);
});

test("save anchors quizzes after regular lessons and edit screen only saves drafts", () => {
  assert.match(api, /lesson: orderedLessonIds\[0\] \|\| null/);
  assert.match(api, /section\.lessons\[left\]\.type === 'اختبار'/);
  assert.match(form, /save\(isAdminFlow \|\| existingCourse \? course\.status : "قيد المراجعة"\)/);
  assert.match(form, /سيتم حفظ التعديلات دون إرسال الدورة للمراجعة/);
});

test("teacher course list and details share the same status badge palette", () => {
  assert.equal(courseStatusStyles["مسودة"], "bg-[#E5E7EB] text-[#667085]");
  assert.match(details, /courseStatusStyles\[course\.status\]/);
  assert.match(read("../src/features/course-management/pages/TeacherCoursesPage.jsx"), /courseStatusStyles\[course\.status\]/);
});
