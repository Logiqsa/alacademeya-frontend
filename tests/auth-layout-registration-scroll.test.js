import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const layout = readFileSync(new URL("../src/components/auth/AuthLayout.jsx", import.meta.url), "utf8");

test("long registration forms start at the top of their scroll container", () => {
  assert.match(layout, /pathname === "\/register"/);
  assert.match(layout, /longRegistrationForm \? "items-start" : "items-center"/);
  assert.match(layout, /overflow-y-auto/);
});
