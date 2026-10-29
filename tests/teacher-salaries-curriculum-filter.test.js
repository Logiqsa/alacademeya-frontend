import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL(
  "../src/pages/admin/teacher-salaries/TeacherSalariesPage.jsx",
  import.meta.url,
);

test("teacher salaries sends the selected curriculum to both salary endpoints", async () => {
  const source = await readFile(pageUrl, "utf8");

  assert.match(source, /getCurriculums\(\)/);
  assert.match(source, /curriculum: curriculum \|\| undefined/);
  assert.match(source, /<option value="">كل المناهج<\/option>/);
});
