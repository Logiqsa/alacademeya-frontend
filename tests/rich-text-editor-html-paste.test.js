import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/components/shared/RichTextEditor.jsx", import.meta.url), "utf8");

test("plain HTML pasted into the rich text editor is imported as formatted content", () => {
  assert.match(source, /HTML_TEXT_PATTERN\.test\(pastedText\)/);
  assert.match(source, /event\.preventDefault\(\)/);
  assert.match(source, /editor\.clipboard\.dangerouslyPasteHTML\(range\.index, pastedText, "user"\)/);
  assert.match(source, /addEventListener\("paste", handlePaste\)/);
  assert.match(source, /removeEventListener\("paste", handlePaste\)/);
});
