import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/pages/InstructorAgreementPage.jsx", import.meta.url), "utf8");

test("public policy shows its actual publication date", () => {
  assert.match(source, /policy\?\.publishedAt/);
  assert.match(source, /تاريخ النشر:/);
  assert.doesNotMatch(source, /تاريخ السريان:/);
});

test("public policy page does not expose the internal version label", () => {
  assert.doesNotMatch(source, /policy\?\.version/);
  assert.doesNotMatch(source, /الإصدار \{/);
});
