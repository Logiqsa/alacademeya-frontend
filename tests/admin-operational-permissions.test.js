import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("admin can load ordinary users and create academic students", () => {
  const users = read("../src/pages/admin/users/Userspage.jsx");
  const createStudent = read("../src/pages/admin/users/CreateStudentPage.jsx");

  assert.match(users, /\["admin", "super-admin"\]\.includes\(currentRole\)/);
  assert.match(users, /\["admin", "super-admin"\]\.includes\(currentUser\?\.role\)/);
  assert.match(createStudent, /\["admin", "super-admin"\]\.includes\(user\?\.role\)/);
});
