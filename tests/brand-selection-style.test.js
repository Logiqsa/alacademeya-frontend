import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const styles = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src/index.css"),
  "utf8",
);

test("text selection uses the primary brand color globally", () => {
  assert.match(styles, /::selection\s*\{\s*background:\s*var\(--primary\);/);
  assert.match(styles, /::-moz-selection\s*\{\s*background:\s*var\(--primary\);/);
});
