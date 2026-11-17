import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pageSource = readFileSync(
  new URL("../src/pages/teacher/groups/GroupLessonsPage.jsx", import.meta.url),
  "utf8",
);
const tableSource = readFileSync(
  new URL(
    "../src/components/teacher/groups/lessons/LessonsTable.jsx",
    import.meta.url,
  ),
  "utf8",
);

test("lesson durations show hours and remaining minutes", () => {
  assert.match(pageSource, /`\$\{hours\} ساعة و\$\{remainingMinutes\} دقيقة`/);
  assert.match(pageSource, /durationLabel\(s\.duration\)/);
  assert.match(pageSource, /durationLabel\(elapsedMinutes\)/);
});

test("admin end-session controls stay hidden in desktop and mobile tables", () => {
  assert.equal(
    tableSource.match(/\{role !== "admin" && lesson\.rawStatus === "live" && \(/g)?.length,
    2,
  );
  assert.match(tableSource, /onEndSession\?\.\(lesson\)/);
});
