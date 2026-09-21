import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { getDashboardPathByRole, isInstructor } from "../src/utils/roles.js";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const active = { isActive: true, registrationStatus: "active" };

test("Instructor-only defaults to its marketplace dashboard without changing role", () => {
  const instructor = { ...active, role: "user", instructorId: "instructor-1", instructorStatus: "active" };
  assert.equal(isInstructor(instructor), true);
  assert.equal(instructor.role, "user");
  assert.equal(getDashboardPathByRole(instructor), "/instructor-dashboard");
  assert.notEqual(getDashboardPathByRole(instructor), "/teacher/earnings");
  assert.equal(getDashboardPathByRole({ ...active, role: "user" }), "/learner-dashboard");
});

test("Teacher dashboard remains authoritative with or without Instructor capability", () => {
  assert.equal(getDashboardPathByRole({ ...active, role: "teacher", status: "approved" }), "/teacher-dashboard");
  assert.equal(getDashboardPathByRole({ ...active, role: "teacher", status: "approved", instructorId: "instructor-1", instructorStatus: "active" }), "/teacher-dashboard");
});

test("a slow account-state request cannot classify an authenticated account as pending", () => {
  assert.equal(getDashboardPathByRole({ role: "user" }), "/learner-dashboard");
  assert.equal(getDashboardPathByRole({ role: "teacher" }), "/teacher-dashboard");
  assert.equal(
    getDashboardPathByRole({ role: "teacher", registrationStatus: "pending" }),
    "/pending",
  );
});

test("suspended Instructor cannot default to or enter the active dashboard flow", () => {
  const suspended = { ...active, role: "user", instructorId: "instructor-1", instructorStatus: "suspended" };
  assert.equal(getDashboardPathByRole(suspended), "/account-state");
  const app = read("src/App.jsx");
  const guard = read("src/guards/InstructorGuard.jsx");
  assert.match(app, /path="\/instructor-dashboard"[\s\S]*InstructorGuard requireActiveStatus/);
  assert.match(guard, /instructorStatus === "suspended"/);
  assert.match(guard, /requireActiveStatus && instructorStatus !== "active"/);
});

test("Instructor dashboard and navigation use existing marketplace APIs without academic UI", () => {
  const dashboard = read("src/pages/teacher/InstructorDashboardPage.jsx");
  const sidebar = read("src/components/teacher/layout/TeacherSidebar.jsx");
  assert.match(dashboard, /fetchTeacherCourses\(\)/);
  assert.match(dashboard, /getEarningsSummary\(\)/);
  assert.match(dashboard, /getInstructorBalance\(\)/);
  assert.match(dashboard, /getWithdrawals\(/);
  assert.match(dashboard, /<TeacherLayout showBreadcrumbs=\{false\}>/);
  assert.match(dashboard, /<NotificationsSection \/>/);
  assert.match(dashboard, /لا توجد دورات بعد/);
  assert.match(sidebar, /const isTeacher = user\?\.role === "teacher"/);
  assert.match(sidebar, /path: "\/teacher\/courses\/new"/);
  assert.match(sidebar, /title: "الأرباح والسحوبات"[\s\S]*?path: "\/teacher\/earnings"/);
  assert.doesNotMatch(sidebar, /path: "\/teacher\/earnings#withdrawals"/);
  assert.doesNotMatch(dashboard, /مجموعات|حضور|واجبات|جدول الحصص/);
  assert.doesNotMatch(dashboard, /role\s*===?\s*["']instructor["']/);
});

test("Instructor marketplace routes remain profile-guarded rather than Teacher-role guarded", () => {
  const app = read("src/App.jsx");
  for (const route of ["/teacher/courses/new", "/teacher/earnings", "/teacher/earnings/commission-rates"]) {
    const index = app.indexOf(`path="${route}"`);
    assert.notEqual(index, -1);
    assert.match(app.slice(index, index + 240), /<InstructorGuard/);
  }
});

test("messages and notifications accept both teachers and active marketplace instructors", () => {
  const app = read("src/App.jsx");
  const sharedGuard = read("src/guards/TeacherOrInstructorGuard.jsx");
  for (const route of ["/teacher/messages", "/teacher/notifications"]) {
    const index = app.indexOf(`path="${route}"`);
    assert.notEqual(index, -1);
    assert.match(app.slice(index, index + 220), /<TeacherOrInstructorGuard>/);
  }
  assert.match(sharedGuard, /user\?\.role === "teacher"/);
  assert.match(sharedGuard, /<InstructorGuard requireActiveStatus>/);
});
