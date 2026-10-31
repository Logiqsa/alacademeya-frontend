import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("high-volume teacher and group screens use their scoped summary clients", () => {
  const api = read("src/services/APIService.js");
  const stats = read("src/components/teacher/dashboard/StatsTeacherCard.jsx");
  const assignments = read("src/pages/teacher/assignments/AssignmentsPage.jsx");
  const sessions = read("src/pages/admin/teachers/TeacherSessionsPage.jsx");
  const groups = read("src/components/admin/groups/Groupstable.jsx");

  assert.match(api, /API\.get\("\/teachers\/me\/dashboard-summary"\)/);
  assert.match(api, /API\.get\("\/assignments\/teacher-summary"\)/);
  assert.match(api, /API\.get\(`\/teachers\/\$\{teacherId\}\/sessions`/);
  assert.match(api, /API\.get\(`\/classrooms\/\$\{classroomId\}\/enrollment-options`\)/);
  assert.match(stats, /getMyTeacherDashboardSummary/);
  assert.doesNotMatch(stats, /getClassroomStudents|getClassroomSessions/);
  assert.match(assignments, /getMyTeacherAssignmentSummaries/);
  assert.doesNotMatch(assignments, /getAssignmentSubmissions|getClassroomSessions/);
  assert.match(sessions, /getTeacherSessionList/);
  assert.doesNotMatch(sessions, /getTeacherMissedSessions|getClassroomSessions/);
  assert.match(groups, /getClassroomEnrollmentOptions/);
  assert.match(api, /month \? \{ month \} : \{\}/);
  const enrollmentModal = groups.slice(
    groups.indexOf("const AddStudentModal"),
    groups.indexOf("const AssignTeacherModal"),
  );
  assert.doesNotMatch(enrollmentModal, /getCurriculumStages\(|getAllStudents\(/);
});
