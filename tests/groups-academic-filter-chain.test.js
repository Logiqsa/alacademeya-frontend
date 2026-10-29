import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(
  new URL("../src/pages/admin/groups/Groupspage.jsx", import.meta.url),
  "utf8",
);
const filters = readFileSync(
  new URL("../src/components/admin/groups/Groupsfilters.jsx", import.meta.url),
  "utf8",
);

test("group filters follow curriculum, stage, grade, then subject", () => {
  assert.match(page, /setFilterCurriculum\(value\);[\s\S]*setFilterStage\("جميع المراحل"\);[\s\S]*setFilterGrade\("جميع الصفوف"\);[\s\S]*setFilterSubject\("جميع المواد"\)/);
  assert.match(page, /setFilterStage\(value\);[\s\S]*setFilterGrade\("جميع الصفوف"\);[\s\S]*setFilterSubject\("جميع المواد"\)/);
  assert.match(page, /setFilterGrade\(value\);[\s\S]*setFilterSubject\("جميع المواد"\)/);
  assert.match(filters, /disabled=\{filterCurriculum === "جميع المناهج"\}/);
  assert.match(filters, /disabled=\{filterStage === "جميع المراحل"\}/);
  assert.match(filters, /disabled=\{filterGrade === "جميع الصفوف"\}/);
});
