import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const source = fs.readFileSync(
  path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "src/pages/teacher/groups/GroupLessonsPage.jsx",
  ),
  "utf8",
);

test("group lessons header exposes academic group details through an accessible tooltip", () => {
  assert.match(source, /CircleHelp/);
  assert.match(source, /تفاصيل المجموعة التعليمية/);
  assert.match(source, /role="tooltip"/);
  assert.match(source, /المنهج/);
  assert.match(source, /المرحلة/);
  assert.match(source, /الصف/);
  assert.match(source, /المادة/);
  assert.match(source, /academicNames\.curriculum/);
  assert.match(source, /academicNames\.stage/);
  assert.match(source, /academicNames\.grade/);
  assert.match(source, /resolveAcademicName/);
  assert.match(source, /isMongoId/);
  assert.match(source, /endpoint التفاصيل يعيدها[\s\S]*populated/);
  assert.match(source, /group-focus-within:opacity-100/);
});
