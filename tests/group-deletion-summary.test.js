import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("group deletion requires a loaded summary and explicit confirmation", () => {
  const source = fs.readFileSync(
    new URL("../src/components/admin/groups/Groupstable.jsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /getClassroomDeletionSummary/);
  assert.match(source, /أفهم أن هذه البيانات ستُحذف نهائيًا/);
  assert.match(source, /!summary \|\| !confirmed/);
});
