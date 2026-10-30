import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("supervisor phones use the shared country-aware display", () => {
  const page = read("../src/pages/admin/supervisors/SupervisorsPage.jsx");
  const table = read("../src/components/admin/supervisors/SupervisorsTable.jsx");
  assert.match(page, /getCountries/);
  assert.match(page, /countryOptions=\{countryOptions\}/);
  assert.match(table, /import PhoneDisplay/);
  assert.equal(table.match(/<PhoneDisplay/g)?.length, 2);
});

test("legacy local phone display removes the trunk zero after a dial code", () => {
  const phoneDisplay = read("../src/components/account-settings/PhoneDisplay.jsx");
  assert.match(phoneDisplay, /phoneDigits\.replace\(\/\^0\+\//);
  assert.match(phoneDisplay, /hasInternationalPrefix/);
});
