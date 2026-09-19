import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/pages/admin/course-finances/CourseFinancesPage.jsx", import.meta.url), "utf8");

test("finance filter options load independently from the filtered report", () => {
  assert.match(source, /getCourseEarningsByCourse\(\{\}\)/);
  assert.match(source, /getCourseEarningsByInstructor\(\{\}\)/);
  assert.match(source, /\.\.\.filterOptions\.courses/);
  assert.match(source, /\.\.\.filterOptions\.instructors/);
});
