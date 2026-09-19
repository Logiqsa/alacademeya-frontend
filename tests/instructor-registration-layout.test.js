import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const register = readFileSync(new URL("../src/components/auth/RegisterForm.jsx", import.meta.url), "utf8");

test("instructor registration links the agreement from the consent control", () => {
  assert.match(register, /id="instructor-agreement"/);
  assert.match(register, /htmlFor="instructor-agreement"/);
  assert.match(register, /to="\/policies\/instructor-agreement"/);
  assert.match(register, /target="_blank"/);
  assert.match(register, /اتفاقية المحاضر الحالية/);
});

test("instructor form uses consistent responsive spacing", () => {
  assert.match(register, /max-w-175 px-4 py-7 sm:px-6 sm:py-9/);
  assert.match(register, /type === "instructor" \? "space-y-5"/);
  assert.match(register, /sm:p-5/);
  assert.match(register, /الاسم الكامل/);
  assert.match(register, /fullName: formData\.fullName\.trim\(\)/);
});
