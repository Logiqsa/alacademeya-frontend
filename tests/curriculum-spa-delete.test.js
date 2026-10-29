import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL(
  "../src/pages/admin/curriculum/CreateCurriculumPage.jsx",
  import.meta.url,
);

test("deleting saved curriculum entities updates local state without reloading the SPA", async () => {
  const source = await readFile(pageUrl, "utf8");

  assert.doesNotMatch(source, /window\.location\.reload/);
  assert.match(source, /await deleteStageRecord\(savedStage\)/);
  assert.match(source, /await deleteGradeRecord\(savedGrade\)/);
  assert.match(source, /await deleteSubjectRecord\(savedSubject\)/);
  assert.match(source, /setOriginalStructure/);
});
