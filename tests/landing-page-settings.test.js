import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const landing = readFileSync(new URL("../src/pages/Landing.jsx", import.meta.url), "utf8");
const admin = readFileSync(new URL("../src/components/admin/dashboard/LandingStatsSettings.jsx", import.meta.url), "utf8");
const hook = readFileSync(new URL("../src/hooks/useLandingPageSettings.js", import.meta.url), "utf8");
const api = readFileSync(new URL("../src/services/APIService.js", import.meta.url), "utf8");

test("landing sections use public backend visibility settings", () => {
  assert.match(landing, /useLandingPageSettings\(\)/);
  for (const key of ["hero", "featuredCourses", "pricing", "stats", "features", "blog", "services", "faq"]) {
    assert.match(landing, new RegExp(`sections\\.${key}`));
  }
  assert.match(hook, /getLandingPageSettings\(\)/);
  assert.doesNotMatch(hook, /localStorage/);
});

test("admin can persist visibility and all four landing statistics", () => {
  assert.match(admin, /updateLandingPageSettings/);
  assert.match(admin, /sections: settings\.sections/);
  for (const key of ["teachers", "students", "courses", "satisfaction"]) {
    assert.match(admin, new RegExp(`key: "${key}"`));
  }
  assert.match(api, /API\.patch\("\/landing-page-settings", payload\)/);
});
