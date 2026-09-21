import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const landing = readFileSync(new URL("../src/pages/Landing.jsx", import.meta.url), "utf8");
const admin = readFileSync(new URL("../src/components/admin/dashboard/LandingStatsSettings.jsx", import.meta.url), "utf8");
const hook = readFileSync(new URL("../src/hooks/useLandingPageSettings.js", import.meta.url), "utf8");
const api = readFileSync(new URL("../src/services/APIService.js", import.meta.url), "utf8");
const navbar = readFileSync(new URL("../src/components/layout/Navbar.jsx", import.meta.url), "utf8");
const homeLayout = readFileSync(new URL("../src/components/layout/HomeLayout.jsx", import.meta.url), "utf8");
const hero = readFileSync(new URL("../src/components/landing/Hero.jsx", import.meta.url), "utf8");
const document = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const styles = readFileSync(new URL("../src/index.css", import.meta.url), "utf8");
const pricing = readFileSync(new URL("../src/components/landing/Pricing.jsx", import.meta.url), "utf8");

test("landing sections use public backend visibility settings", () => {
  assert.match(landing, /useLandingPageSettings\(\)/);
  for (const key of ["hero", "featuredCourses", "pricing", "stats", "features", "blog", "services", "faq"]) {
    assert.match(landing, new RegExp(`sections\\.${key}`));
  }
  assert.match(hook, /getLandingPageSettings\(\)/);
  assert.doesNotMatch(hook, /localStorage/);
});

test("mobile navigation stays above the scroll button and scrolls on short screens", () => {
  assert.match(navbar, /z-\[80\]/);
  assert.match(navbar, /h-dvh/);
  assert.match(navbar, /min-h-0 flex-1 flex-col[^"]*overflow-y-auto/);
  assert.match(homeLayout, /z-30/);
  assert.match(navbar, /aria-label="فتح القائمة"/);
  assert.match(navbar, /aria-expanded=\{menuOpen\}/);
});

test("first viewport avoids the decorative bitmap and late font stylesheet discovery", () => {
  assert.doesNotMatch(hero, /hero\.png/);
  assert.match(hero, /fetchPriority="high"/);
  assert.match(hero, /width="502"/);
  assert.match(document, /rel="preconnect" href="https:\/\/fonts\.gstatic\.com"/);
  assert.doesNotMatch(styles, /@import url\("https:\/\/fonts\.googleapis\.com/);
  assert.doesNotMatch(document, /media="print" onload="this\.media='all'"/);
  assert.match(pricing, /aria-label="الأسعار السنوية"/);
  assert.match(pricing, /aria-pressed=\{isAnnual\}/);
});

test("navbar hides links for landing sections disabled by the admin", () => {
  assert.match(navbar, /const \{ sections \} = useLandingPageSettings\(\)/);
  for (const key of ["featuredCourses", "pricing", "features", "blog", "services", "faq"]) {
    assert.match(navbar, new RegExp(`sectionKey: "${key}"`));
  }
  assert.match(navbar, /\.filter\(\(item\) => !item\.sectionKey \|\| sections\[item\.sectionKey\]\)/);
});

test("admin can persist visibility and all four landing statistics", () => {
  assert.match(admin, /updateLandingPageSettings/);
  assert.match(admin, /sections: settings\.sections/);
  for (const key of ["teachers", "students", "courses", "satisfaction"]) {
    assert.match(admin, new RegExp(`key: "${key}"`));
  }
  assert.match(api, /API\.patch\("\/landing-page-settings", payload\)/);
});
