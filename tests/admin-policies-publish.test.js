import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/pages/admin/AdminPoliciesPage.jsx", import.meta.url), "utf8");

test("admin policy editor publishes in one action without a draft button", () => {
  assert.match(source, /await createAdminPolicyDraft\(type, payload\(\)\)/);
  assert.match(source, /await updateAdminPolicyDraft\(selected\.id \|\| selected\._id, payload\(\)\)/);
  assert.match(source, /await publishAdminPolicy\(policy\.id \|\| policy\._id\)/);
  assert.match(source, /نشر الاتفاقية/);
  assert.doesNotMatch(source, /حفظ المسودة/);
  assert.doesNotMatch(source, /مسودة جديدة/);
});

test("course publishing criteria use generated technical keys", () => {
  assert.match(source, /key: `criterion_\$\{index \+ 1\}`/);
  assert.match(source, /sortOrder: index/);
  assert.doesNotMatch(source, /placeholder="المفتاح"/);
  assert.match(source, /placeholder="عنوان المعيار"/);
});
