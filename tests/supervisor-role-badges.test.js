import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(
  new URL(
    "../src/components/admin/supervisors/SupervisorsTable.jsx",
    import.meta.url,
  ),
  "utf8",
);

test("supervisor roles are displayed as distinct badges on desktop and mobile", () => {
  assert.match(source, /const RoleBadge/);
  assert.match(source, /role === "super-admin"/);
  assert.match(source, /return "مشرف عام"/);
  assert.match(source, /return "مشرف"/);
  assert.equal(source.match(/<RoleBadge role=\{s\.role\} \/>/g)?.length, 2);
  assert.match(source, /bg-\[#F3E8FF\]/);
  assert.match(source, /bg-\[#EAF4FF\]/);
});
