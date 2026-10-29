import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const read = (filename) =>
  fs.readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), "..", filename),
    "utf8",
  );

test("replacement-teacher UI keeps its established action name and uses the scoped candidate endpoint", () => {
  const api = read("src/services/APIService.js");
  const substituteModal = read(
    "src/components/admin/groups/SubstituteTeacherModal.jsx",
  );
  const groups = read("src/components/admin/groups/Groupstable.jsx");
  const lessonCreation = read(
    "src/components/teacher/groups/lessons/CreateLessonPage.jsx",
  );

  assert.match(api, /getClassroomReplacementTeachers/);
  assert.match(api, /\/replacement-teachers/);
  assert.match(substituteModal, /اختيار معلم بديل/);
  assert.match(substituteModal, /سيُزال المعلم الحالي[\s\S]*شات المجموعة/);
  assert.match(substituteModal, /getClassroomReplacementTeachers\(groupId\)/);
  assert.match(substituteModal, /toast\.success\("تم التعيين بنجاح"\)/);
  assert.match(substituteModal, /معايير ظهور المعلمين في القائمة/);
  assert.match(substituteModal, /نفس[\s\S]*المنهج والمرحلة والصف والمادة/);
  assert.doesNotMatch(substituteModal, /إزالة المعلم البديل/);
  assert.match(groups, /title="تعيين معلم بديل"/);
  assert.match(groups, /getClassroomReplacementTeachers\(group\.id\)/);
  assert.doesNotMatch(lessonCreation, /مدرس الحصة البديل/);
});
