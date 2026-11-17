import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../src/pages/shared/SessionDetailsPage.jsx", import.meta.url),
  "utf8",
);
const apiSource = readFileSync(
  new URL("../src/services/APIService.js", import.meta.url),
  "utf8",
);

test("admin session details use the meeting link stored on the classroom", () => {
  assert.match(apiSource, /getSession = \(sessionId\) => API\.get\(`\/sessions\/\$\{sessionId\}`\)/);
  assert.match(source, /getSession\(sessionId\)/);
  assert.match(source, /const classroom = \{ \.\.\.classroomDetails, \.\.\.sessionClassroom \}/);
  assert.match(source, /data\.classroom\.meetingLink/);
  assert.match(source, /!text-white \[&_svg\]:!text-white/);
});

test("admin end-session controls stay hidden on the details page", () => {
  assert.doesNotMatch(source, />إنهاء الحصة<\/button>/);
  assert.doesNotMatch(source, /<EndSessionDetailsModal/);
});
