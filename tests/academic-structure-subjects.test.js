import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL(
    "../src/components/admin/curriculum/AcademicStructureSection.jsx",
    import.meta.url,
  ),
  "utf8",
);

test("academic structure loads a grade's subjects only when that grade opens", () => {
  assert.match(source, /const GradeRow = \(\{ grade \}\)/);
  assert.match(source, /if \(!open \|\| subjects !== null\) return;/);
  assert.match(source, /getAllSubjects\(\{ grade: gradeId \}\)/);
  assert.match(source, /المواد الدراسية/);
  assert.match(source, /لا توجد مواد مضافة لهذا الصف/);
});
