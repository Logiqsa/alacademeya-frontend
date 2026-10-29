import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../src/pages/admin/teachers/TeachersPage.jsx", import.meta.url),
  "utf8",
);

test("teacher filters load academic choices in curriculum-to-subject order", () => {
  assert.match(source, /getCurriculumStages\(value\)/);
  assert.match(source, /getStageGrades\(value\)/);
  assert.match(source, /getAllSubjects\(\{ grade: value \}\)/);
  assert.match(source, /setFilterStage\(""\);[\s\S]*setFilterGrade\(""\);[\s\S]*setFilterSubject\(""\);/);
  assert.match(source, /disabled: !filterCurriculum/);
  assert.match(source, /disabled: !filterStage/);
  assert.match(source, /disabled: !filterGrade/);
});
