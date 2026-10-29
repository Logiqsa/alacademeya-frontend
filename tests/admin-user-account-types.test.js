import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { adminAccountTypeLabel, mapAdminUser } from "../src/utils/adminUser.js";

test("admin user labels distinguish learners, instructors and academic teachers", () => {
  assert.equal(adminAccountTypeLabel({ role: "user" }), "طالب دورات");
  assert.equal(adminAccountTypeLabel({ role: "user", capabilities: { hasInstructorProfile: true } }), "محاضر دورات");
  assert.equal(adminAccountTypeLabel({ role: "teacher" }), "معلم");
  assert.equal(adminAccountTypeLabel({ role: "teacher", capabilities: { hasInstructorProfile: true } }), "محاضر دورات");
  assert.equal(adminAccountTypeLabel({ role: "student" }), "طالب أكاديمي");
});

test("mapped admin users preserve the backend role for permission actions", () => {
  const mapped = mapAdminUser({ _id: "user-1", role: "user", isActive: true });
  assert.equal(mapped.role, "طالب دورات");
  assert.equal(mapped.rawRole, "user");
});

test("admin user table keeps account type out of its desktop columns", () => {
  const table = readFileSync(
    new URL("../src/components/admin/users/Userstable.jsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(table, /label: "النوع"/);
});
