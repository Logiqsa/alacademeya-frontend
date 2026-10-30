import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("account-specific admin pages label incomplete profiles without hiding them", async () => {
  const users = await read("../src/pages/admin/users/Userspage.jsx");
  const supervisors = await read("../src/pages/admin/supervisors/SupervisorsPage.jsx");
  const supervisorFilters = await read("../src/components/admin/supervisors/SupervisorsFilters.jsx");

  assert.match(users, /hasIncompleteRegistration\(rawUser\)/);
  assert.match(users, /status: "ملف غير مكتمل"/);
  assert.match(supervisors, /hasIncompleteRegistration\(u\)/);
  assert.match(supervisors, /"ملف غير مكتمل"/);
  assert.match(supervisorFilters, /"ملف غير مكتمل"/);
});
