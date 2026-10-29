import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(
  new URL("../src/pages/admin/users/Userspage.jsx", import.meta.url),
  "utf8",
);
const filters = readFileSync(
  new URL("../src/components/admin/users/Usersfilters.jsx", import.meta.url),
  "utf8",
);

test("academic user filters clear and disable their dependent choices", () => {
  assert.match(page, /setFilterCurriculum\(v\);[\s\S]*setFilterStage\("جميع المراحل"\);[\s\S]*setFilterGrade\("جميع الصفوف"\);[\s\S]*setFilterSubject\("جميع المواد"\)/);
  assert.match(page, /setFilterStage\(v\);[\s\S]*setFilterGrade\("جميع الصفوف"\);[\s\S]*setFilterSubject\("جميع المواد"\)/);
  assert.match(page, /setFilterGrade\(v\);[\s\S]*setFilterSubject\("جميع المواد"\)/);
  assert.match(filters, /disabled=\{filterCurriculum === "جميع المناهج"\}/);
  assert.match(filters, /disabled=\{filterGrade === "جميع الصفوف"\}/);
});
