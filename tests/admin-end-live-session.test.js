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

test("admins can end live sessions from desktop and mobile tables", () => {
  assert.equal(
    tableSource.match(/\{lesson\.rawStatus === "live" && \(/g)?.length,
    2,
  );
  assert.doesNotMatch(
    tableSource,
    /role !== "admin" && lesson\.rawStatus === "live"/,
  );
  assert.match(tableSource, /onEndSession\?\.\(lesson\)/);
});
