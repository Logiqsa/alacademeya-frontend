import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";

import {
  buildRegistrationIntent,
  isInstructorSignup,
} from "../src/utils/registrationIntent.js";
import {
  canHaveInstructorProfile,
  isInstructor,
} from "../src/utils/roles.js";

test("learner and Instructor registration use public intent instead of raw roles", () => {
  assert.deepEqual(buildRegistrationIntent("learner"), {
    accountType: "learner",
  });
  assert.deepEqual(buildRegistrationIntent("instructor"), {
    accountType: "instructor",
  });
  assert.equal("role" in buildRegistrationIntent("instructor"), false);
  assert.equal(isInstructorSignup("instructor"), true);
});

test("legacy academic signup flows retain their existing role payload", () => {
  assert.deepEqual(buildRegistrationIntent("student"), { role: "student" });
  assert.deepEqual(buildRegistrationIntent("teacher"), { role: "teacher" });
  assert.deepEqual(buildRegistrationIntent("parent"), { role: "parent" });
});

test("Teacher capability depends on Instructor profile, never teacher role alone", () => {
  const teacherOnly = { role: "teacher" };
  const teacherInstructor = {
    role: "teacher",
    instructorId: "instructor-1",
  };
  assert.equal(canHaveInstructorProfile(teacherOnly), true);
  assert.equal(isInstructor(teacherOnly), false);
  assert.equal(isInstructor(teacherInstructor), true);
});

test("registration UI exposes intentional choices and explicit agreement", () => {
  const accountTypes = fs.readFileSync(
    new URL("../src/pages/auth/AccountTypePage.jsx", import.meta.url),
    "utf8",
  );
  const form = fs.readFileSync(
    new URL("../src/components/auth/RegisterForm.jsx", import.meta.url),
    "utf8",
  );
  assert.match(accountTypes, /id: "learner"/);
  assert.match(accountTypes, /id: "instructor"/);
  assert.match(form, /instructorAgreementAccepted/);
  assert.match(form, /disabled=\{loading \|\|/);
  assert.doesNotMatch(accountTypes, /id: "admin"|id: "super-admin"/);
});

test("existing users receive Become Instructor and suspended-state UI", () => {
  const navbar = fs.readFileSync(
    new URL("../src/components/layout/Navbar.jsx", import.meta.url),
    "utf8",
  );
  const onboarding = fs.readFileSync(
    new URL("../src/pages/teacher/InstructorOnboardingPage.jsx", import.meta.url),
    "utf8",
  );
  assert.match(navbar, /كن محاضرًا/);
  assert.match(onboarding, /profile\?\.status === "suspended"/);
  assert.match(onboarding, /disabled=\{saving/);
});

test("verification synchronizes backend Instructor capability before redirect", () => {
  const verification = fs.readFileSync(
    new URL("../src/pages/auth/VerifyEmailPage.jsx", import.meta.url),
    "utf8",
  );
  assert.match(verification, /await getMyProfile\(\)/);
  assert.match(verification, /capabilities\?\.hasInstructorProfile/);
  assert.match(verification, /getAuthenticatedDestination\(sessionUser\)/);
});
