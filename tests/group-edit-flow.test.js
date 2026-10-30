import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const pageSource = fs.readFileSync(
  new URL("../src/pages/teacher/groups/GroupLessonsPage.jsx", import.meta.url),
  "utf8",
);
const apiSource = fs.readFileSync(
  new URL("../src/services/APIService.js", import.meta.url),
  "utf8",
);

test("admin can edit safe classroom fields from the group page", () => {
  assert.match(pageSource, /تعديل المجموعة/);
  assert.match(pageSource, /handleUpdateGroup/);
  assert.match(pageSource, /updateClassroom\(groupId, payload\)/);
  assert.match(pageSource, /تم تعديل المجموعة بنجاح/);
  assert.match(pageSource, /name, capacity/);
  assert.match(pageSource, /payload\.meetingLink = meetingLink/);
});

test("classroom updates use the protected classroom patch endpoint", () => {
  assert.match(
    apiSource,
    /export const updateClassroom = \(id, payload\) =>[\s\S]*API\.patch\(`\/classrooms\/\$\{id\}`, payload\)/,
  );
});
