import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";

import {
  getDashboardPathByRole,
  isInstructor,
} from "../src/utils/roles.js";

const read = (path) =>
  fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const active = {
  isActive: true,
  isVerified: true,
  registrationStatus: "active",
};

test("course-only role=user resolves to a real marketplace dashboard", () => {
  const learner = { ...active, role: "user" };
  assert.equal(isInstructor(learner), false);
  assert.equal(getDashboardPathByRole(learner), "/learner-dashboard");

  const app = read("src/App.jsx");
  assert.match(app, /path="\/learner-dashboard"[\s\S]*StudentCoursesPage dashboard="learner"/);
  assert.match(app, /path="\/learner-dashboard"[\s\S]*<StudentGuard>/);
});

test("course learner dashboard is User-rooted and requires no Student profile", () => {
  const page = read(
    "src/features/course-management/pages/student/StudentCoursesPage.jsx",
  );
  const api = read("src/features/course-management/api/coursesApi.js");
  assert.match(page, /fetchStudentCourses\(\)/);
  assert.match(page, /مكتبتك فارغة حاليًا/);
  assert.match(api, /getMyCourseEnrollments/);
  assert.doesNotMatch(page, /StudentProfile|academicLevel|curriculum|grade/);
});

test("course learner navigation keeps onboarding visible and Instructor tools hidden", () => {
  const sidebar = read("src/components/student/layout/StudentSidebar.jsx");
  assert.match(sidebar, /marketplaceOnly/);
  assert.match(sidebar, /title: "كن محاضرًا"/);
  assert.match(sidebar, /path: "\/instructor\/onboarding"/);
  assert.doesNotMatch(
    sidebar.match(/const marketplaceMenu = \[[\s\S]*?\n\s{2}\];/)?.[0] || "",
    /teacher\/courses|teacher\/earnings/,
  );
});

test("course Player preserves learner-only marketplace navigation", () => {
  const player = read(
    "src/features/course-management/pages/student/CoursePlayerPage.jsx",
  );
  assert.match(player, /learnerOnly = user\?\.role === 'user'/);
  assert.match(player, /marketplaceOnly: learnerOnly/);
  assert.match(player, /learnerOnly[\s\S]*'\/learner-dashboard'/);
});

test("existing academic and Instructor dashboard resolution stays intact", () => {
  assert.equal(
    getDashboardPathByRole({ ...active, role: "student", status: "active" }),
    "/student-dashboard",
  );
  assert.equal(
    getDashboardPathByRole({ ...active, role: "teacher", status: "approved" }),
    "/teacher-dashboard",
  );
  assert.equal(
    getDashboardPathByRole({
      ...active,
      role: "teacher",
      status: "approved",
      instructorId: "instructor-1",
    }),
    "/teacher-dashboard",
  );
  assert.equal(
    getDashboardPathByRole({
      ...active,
      role: "user",
      instructorId: "instructor-1",
      instructorStatus: "active",
    }),
    "/instructor-dashboard",
  );
});
