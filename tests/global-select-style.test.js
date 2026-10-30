import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native single selects use the shared branded trigger style", async () => {
  const source = await readFile(
    new URL("../src/index.css", import.meta.url),
    "utf8",
  );

  assert.match(source, /select:not\(\[multiple\]\)/);
  assert.match(source, /appearance: none/);
  assert.match(source, /background-image: url/);
  assert.match(
    source,
    /select:not\(\[multiple\]\) \+ svg\s*\{[\s\S]*display: none/,
  );
  assert.match(source, /select:not\(\[multiple\]\):focus-visible/);
});
