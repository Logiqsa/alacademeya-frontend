import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../src/pages/admin/teachers/TeachersPage.jsx", import.meta.url),
  "utf8",
);

test("teacher rows expose the existing details and actions dialog from a three-dot button", () => {
  assert.match(source, /MoreVertical/);
  assert.match(source, /aria-label=\{`إجراءات المعلم \$\{teacher\.name\}`\}/);
  assert.match(source, /onClick=\{\(\) => openTeacherDetails\(teacher\)\}/);
});
