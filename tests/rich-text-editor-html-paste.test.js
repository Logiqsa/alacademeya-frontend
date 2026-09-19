import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/components/shared/RichTextEditor.jsx", import.meta.url), "utf8");
const normalizer = readFileSync(new URL("../src/utils/richTextHtml.js", import.meta.url), "utf8");
const publicPolicy = readFileSync(new URL("../src/pages/InstructorAgreementPage.jsx", import.meta.url), "utf8");
const adminPolicy = readFileSync(new URL("../src/pages/admin/AdminPoliciesPage.jsx", import.meta.url), "utf8");

test("plain HTML pasted into the rich text editor is imported as formatted content", () => {
  assert.match(source, /HTML_TEXT_PATTERN\.test\(pastedText\)/);
  assert.match(source, /event\.preventDefault\(\)/);
  assert.match(source, /editor\.clipboard\.dangerouslyPasteHTML\(range\.index, pastedText, "user"\)/);
  assert.match(source, /addEventListener\("paste", handlePaste, true\)/);
  assert.match(source, /removeEventListener\("paste", handlePaste, true\)/);
});

test("encoded policy markup is normalized for saving and public rendering", () => {
  assert.match(normalizer, /HTML_TEXT_PATTERN\.test\(visibleText\)/);
  assert.match(normalizer, /sanitizeTree\(normalized\.body\)/);
  assert.match(normalizer, /repairReversedRtlTags/);
  assert.match(normalizer, /plainTextFallback/);
  assert.match(adminPolicy, /normalizeRichTextHtml\(content\)/);
  assert.match(publicPolicy, /normalizeRichTextHtml\(localized\(policy\?\.content\)\)/);
});
