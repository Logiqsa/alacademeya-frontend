import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("curriculum saves return to the registered admin dashboard route", async () => {
  const source = await readFile(
    new URL("../src/pages/admin/curriculum/CreateCurriculumPage.jsx", import.meta.url),
    "utf8",
  );

  const saveRedirects = [...source.matchAll(/navigate\("(\/admin[^"]*)"\)/g)]
    .map((match) => match[1]);

  assert.deepEqual(saveRedirects, ["/admin-dashboard", "/admin-dashboard"]);
  assert.doesNotMatch(source, /navigate\("\/admin\/curriculum"\)/);
});
