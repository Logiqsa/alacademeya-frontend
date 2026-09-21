import test from "node:test";
import assert from "node:assert/strict";
import { adminAccountTypeLabel, mapAdminUser } from "../src/utils/adminUser.js";

test("admin user labels distinguish learners, instructors and academic teachers", () => {
  assert.equal(adminAccountTypeLabel({ role: "user" }), "متعلم");
  assert.equal(adminAccountTypeLabel({ role: "user", capabilities: { hasInstructorProfile: true } }), "محاضر");
  assert.equal(adminAccountTypeLabel({ role: "teacher" }), "معلم");
  assert.equal(adminAccountTypeLabel({ role: "teacher", capabilities: { hasInstructorProfile: true } }), "محاضر");
  assert.equal(adminAccountTypeLabel({ role: "student" }), "طالب");
});

test("mapped admin users preserve the backend role for permission actions", () => {
  const mapped = mapAdminUser({ _id: "user-1", role: "user", isActive: true });
  assert.equal(mapped.role, "متعلم");
  assert.equal(mapped.rawRole, "user");
});
