import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const styles = fs.readFileSync(
  new URL("../src/index.css", import.meta.url),
  "utf8",
);

test("data tables use low-specificity zebra rows and hover feedback", () => {
  assert.match(styles, /:where\(table tbody tr:nth-child\(even\)\)/);
  assert.match(styles, /background-color: #f7f9fc/);
  assert.match(styles, /:where\(table tbody tr:hover\)/);
  assert.match(styles, /background-color: #eef4fb/);
});
