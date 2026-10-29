import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../src/components/navigation/RouteProgress.jsx", import.meta.url),
  "utf8",
);

test("route progress starts for browser navigation and cleans up its history hooks", () => {
  assert.match(source, /window\.history\.pushState = function pushState/);
  assert.match(source, /window\.history\.replaceState = function replaceState/);
  assert.match(source, /window\.addEventListener\("popstate", start\)/);
  assert.match(source, /window\.history\.pushState = originalPushState/);
  assert.match(source, /createPortal\(progress, contentContainer\)/);
  assert.match(source, /\[data-route-scroll\]/);
  assert.match(source, /route-progress-bar/);
});
