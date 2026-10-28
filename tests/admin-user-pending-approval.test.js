import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("pending inactive students retain the pending status needed for approval", () => {
  const status = readFileSync(new URL("../src/utils/adminUser.js", import.meta.url), "utf8");
  const usersPage = readFileSync(new URL("../src/pages/admin/users/Userspage.jsx", import.meta.url), "utf8");

  assert.match(status, /registrationStatus\?\.startsWith\("pending"\)[\s\S]*?!u\.isActive/);
  assert.match(usersPage, /mapped\.status === "معلق"[\s\S]*?\? mapped\.status/);
});
