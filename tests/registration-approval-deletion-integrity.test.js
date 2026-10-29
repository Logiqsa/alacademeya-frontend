import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("all approval UI paths use the narrow registration-approval action", () => {
  const api = read("src/services/APIService.js");
  const helper = read("src/utils/approveRegistrationRequest.js");
  const teachersPage = read("src/pages/admin/teachers/TeachersPage.jsx");

  assert.match(api, /API\.post\(`\/users\/\$\{id\}\/approve-registration`\)/);
  assert.match(helper, /return approveRegistration\(userId\)/);
  assert.doesNotMatch(helper, /updateUser\(|updateStudentProfile\(|updateTeacherProfile\(/);
  assert.match(teachersPage, /approveRegistrationRequest\(\{ userId: selectedTeacher\.userId \}\)/);
});

test("curriculum editing never deletes child records before its parent delete succeeds", () => {
  const source = read("src/pages/admin/curriculum/CreateCurriculumPage.jsx");
  const gradeDelete = source.slice(
    source.indexOf("const deleteGradeRecord"),
    source.indexOf("const deleteStageRecord"),
  );
  const stageDelete = source.slice(
    source.indexOf("const deleteStageRecord"),
    source.indexOf("const saveSubject"),
  );

  assert.match(gradeDelete, /\(\) => deleteGrade\(gradeId\)/);
  assert.match(stageDelete, /\(\) => deleteStage\(stageId\)/);
  assert.doesNotMatch(gradeDelete, /deleteSubjectRecord/);
  assert.doesNotMatch(stageDelete, /deleteGradeRecord/);
});

test("academic delete failures preserve the displayed curriculum and use the server error", () => {
  const source = read("src/components/admin/curriculum/AcademicStructureSection.jsx");
  const deleteHandler = source.slice(
    source.indexOf("const handleDelete"),
    source.indexOf("return (", source.indexOf("const handleDelete")),
  );

  assert.match(deleteHandler, /setCurricula\(\(p\) => p\.filter/);
  assert.match(deleteHandler, /await deleteCurriculum\(id\)/);
  assert.match(deleteHandler, /setCurricula\(prev\)/);
  assert.match(deleteHandler, /toast\.error\(err\.response\?\.data\?\.message/);
  assert.ok(deleteHandler.indexOf("setCurricula(prev)") > deleteHandler.indexOf("await deleteCurriculum(id)"));
});

test("retained account deletion shows a safe super-admin redaction path", () => {
  const api = read("src/services/APIService.js");
  const page = read("src/pages/admin/users/Userspage.jsx");
  const table = read("src/components/admin/users/Userstable.jsx");

  assert.match(api, /API\.get\(`\/users\/\$\{id\}\/deletion-impact`\)/);
  assert.match(api, /API\.post\(`\/users\/\$\{id\}\/anonymize-retained-account`, options\)/);
  assert.match(page, /USER_HAS_RETAINED_RECORDS/);
  assert.match(page, /getUserDeletionImpact\(user\.id\)/);
  assert.match(page, /anonymizeRetainedUser\(user\.id/);
  assert.match(table, /السجلات التي ستبقى محفوظة/);
  assert.match(table, /تأكيد الإخفاء الآمن/);
  assert.match(table, /إزالة من الفصول والمجموعات النشطة/);
  assert.match(table, /إزالة من غرف الشات النشطة/);
  assert.match(page, /removeFromActiveClassrooms/);
  assert.match(page, /removeFromActiveChatRooms/);
});
