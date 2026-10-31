import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../src/pages/admin/teachers/TeachersPage.jsx", import.meta.url),
  "utf8",
);

test("teacher rows expose the existing details and actions dialog from a three-dot button", () => {
  assert.match(source, /MoreVertical/);
  assert.match(source, /aria-label=\{`إجراءات المعلم \$\{teacher\.name\}`\}/);
  assert.match(source, /setActionMenu/);
  assert.match(source, /عرض التفاصيل والإجراءات/);
  assert.match(source, /void openTeacherDetails\(teacher\)/);
  assert.match(source, /selectedTeacher && createPortal/);
  assert.match(source, /document\.body/);
});

test("teacher rows keep incomplete profiles visible and separate status from actions", () => {
  assert.doesNotMatch(source, /const completedTeachers = list\.filter/);
  assert.match(source, /isProfileIncomplete: hasIncompleteRegistration|const isProfileIncomplete = hasIncompleteRegistration/);
  assert.match(source, /"الملف غير مكتمل"/);
  assert.match(source, /"الحالة",\s*"الإجراءات"/);
});

test("teacher status header filters the table by the selected state", () => {
  assert.match(source, /aria-label="تصفية المعلمين حسب الحالة"/);
  assert.match(source, /teacher\.status === filterStatus/);
  assert.match(source, /setFilterStatus\(event\.target\.value\)/);
});
