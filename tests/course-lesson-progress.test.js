import assert from "node:assert/strict";
import test from "node:test";

import { countCompletedLessons } from "../src/features/course-management/api/lessonProgress.js";

test("counts completed lessons from the learning curriculum, excluding quizzes", () => {
  assert.deepEqual(countCompletedLessons([
    { lessons: [
      { progress: { status: "completed" } },
      { progress: { status: "completed" } },
    ], quizzes: [{ passed: true }] },
    { lessons: [{ progress: { status: "in_progress" } }] },
  ]), { completedLessons: 2, totalLessons: 3 });
});

test("keeps the enrollment summary when the learning curriculum is unavailable", () => {
  assert.equal(countCompletedLessons(undefined), null);
});
