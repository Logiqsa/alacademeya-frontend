import test from "node:test";
import assert from "node:assert/strict";
import { buildManualSubscriptionPayload, buildRenewalPayload, adminApiErrorMessage } from "../src/utils/adminSubscription.js";

const item = { subject:"subject-1", package:"package-1", teacher:"teacher-1", classroom:"room-1", type:"group", discount:"5", price:999, status:"active" };

test("manual subscription uses the student profile id and excludes controlled fields", () => {
  const payload = buildManualSubscriptionPayload("student-profile-id", [item]);
  assert.equal(payload.student, "student-profile-id");
  assert.deepEqual(payload.items[0], { subject:"subject-1", package:"package-1", teacher:"teacher-1", classroom:"room-1", type:"group", discount:5 });
});

test("renewal confirmation is omitted first and resent as a boolean", () => {
  assert.equal("confirmReplaceActive" in buildRenewalPayload([item]), false);
  assert.equal(buildRenewalPayload([item], true).confirmReplaceActive, true);
  assert.equal(typeof buildRenewalPayload([item], true).confirmReplaceActive, "boolean");
});

test("known backend validation codes are localized", () => {
  const error = { response: { data: { code: "TEACHER_DOES_NOT_SUPPORT_SUBJECT" } } };
  assert.match(adminApiErrorMessage(error), /المعلم/);
});
