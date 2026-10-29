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
  assert.match(api, /API\.get\(`\/users\/\$\{id\}\/deletion-impact\/\$\{encodeURIComponent\(referenceType\)\}`\)/);
  assert.match(api, /API\.post\(`\/users\/\$\{id\}\/anonymize-retained-account`, options\)/);
  assert.match(page, /USER_HAS_RETAINED_RECORDS/);
  assert.match(page, /getUserDeletionImpact\(user\.id\)/);
  assert.match(page, /getUserDeletionReferenceDetails\(user\.id, referenceType\)/);
  assert.match(page, /hasInternalRecords: Boolean\(impact\?\.hasInternalRecords\)/);
  assert.match(page, /anonymizeRetainedUser\(user\.id/);
  assert.match(table, /السجلات التعليمية والمالية المرتبطة/);
  assert.match(table, /تأكيد الإخفاء الآمن/);
  assert.match(table, /showReferenceDetails/);
  assert.match(table, /aria-expanded=\{expanded\}/);
  assert.match(table, /جاري التحقق من السجلات المرتبطة بالحساب/);
  assert.match(table, /أرباح المحاضرين وسجلات موافقة السياسات وأمان المحتوى/);
  assert.match(table, /dialogClassName="max-w-5xl max-h-\[92vh\] overflow-y-auto p-5 sm:p-7"/);
  assert.match(table, /const retainedRecordCard/);
  assert.match(table, /شراء دورة:/);
  assert.match(table, /شهادة دورة:/);
  assert.match(table, /مجموعة:/);
  assert.match(table, /accent-\[#123C91\]/);
  assert.match(table, /const cardDetails/);
  assert.match(table, /إيقاف الفصول والمجموعات النشطة التي يدرّسها هذا الحساب/);
  assert.match(table, /لا يوقف أي معلم آخر/);
  assert.match(table, /cursor-pointer select-none items-center/);
  assert.match(table, /border-\[#123C91\] bg-\[#EEF4FF\]/);
  assert.match(table, /grid max-h-\[38vh\] grid-cols-1 gap-3 overflow-y-auto pl-1 lg:grid-cols-2/);
  assert.match(table, /<article key=\{record\._id \|\| index\}/);
  assert.doesNotMatch(table, /const retainedRecordFields/);
  assert.doesNotMatch(table, /<details key=\{record\._id \|\| index\}/);
  assert.match(table, /grid grid-cols-1 gap-3 lg:grid-cols-2/);
  assert.match(table, /لا تُعرض المعرفات التقنية أو البيانات الحساسة/);
  assert.doesNotMatch(table, /JSON\.stringify\(record, null, 2\)/);
  assert.match(table, /إزالة الحساب من الفصول والمجموعات النشطة/);
  assert.match(table, /إزالة الحساب من غرف الشات النشطة/);
  assert.match(page, /removeFromActiveClassrooms/);
  assert.match(page, /removeFromActiveChatRooms/);
});
