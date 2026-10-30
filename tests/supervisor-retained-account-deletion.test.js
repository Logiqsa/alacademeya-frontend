import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(
  new URL("../src/pages/admin/supervisors/SupervisorsPage.jsx", import.meta.url),
  "utf8",
);

test("supervisors with retained records use the existing safe anonymization flow", () => {
  assert.match(source, /USER_HAS_RETAINED_RECORDS/);
  assert.match(source, /getUserDeletionImpact\(deleteTarget\.id\)/);
  assert.match(source, /anonymizeRetainedUser\(retainedTarget\.supervisor\.id/);
  assert.match(source, /إخفاء الحساب بأمان/);
});
