import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("missing session duration is not presented as 45 minutes", async () => {
  const list = await read("../src/pages/student/groupLessons/Studentgrouplessonspage.jsx");
  const details = await read("../src/pages/student/groupLessons/Studentlessondetailspage.jsx");

  assert.match(list, /s\.duration > 0 \? s\.duration : "غير محددة"/);
  assert.match(details, /session\.duration > 0/);
  assert.match(details, /"مدة غير محددة"/);
  assert.doesNotMatch(list, /s\.duration \|\| 45/);
  assert.doesNotMatch(details, /session\.duration \|\| 45/);
});
