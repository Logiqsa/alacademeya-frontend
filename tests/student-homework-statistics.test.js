import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page = fs.readFileSync(
  new URL("../src/pages/teacher/groups/StudentDetailsPage.jsx", import.meta.url),
  "utf8",
);
const api = fs.readFileSync(
  new URL("../src/services/APIService.js", import.meta.url),
  "utf8",
);

test("student details displays real classroom homework submission statistics", () => {
  assert.match(api, /classroom\/\$\{classroomId\}\/students\/\$\{studentId\}\/statistics/);
  assert.match(page, /getClassroomStudentAssignmentStatistics\(groupId, entry\.id\)/);
  assert.match(page, /homeworkDone: homeworkStats\.submitted/);
  assert.match(page, /homeworkTotal: homeworkStats\.total/);
});
