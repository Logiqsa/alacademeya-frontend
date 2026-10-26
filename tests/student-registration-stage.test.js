import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const registrationForm = readFileSync(
  new URL("../src/components/auth/RegisterForm.jsx", import.meta.url),
  "utf8",
);
const studentDetails = readFileSync(
  new URL("../src/pages/auth/StudentDetailsPages.jsx", import.meta.url),
  "utf8",
);

test("the academic stage is collected only while completing the student profile", () => {
  assert.doesNotMatch(registrationForm, /name="academicLevel"/);
  assert.doesNotMatch(registrationForm, /payload\.academicLevel/);
  assert.match(studentDetails, /label="المرحلة الدراسية"/);
  assert.match(studentDetails, /stageId/);
});
