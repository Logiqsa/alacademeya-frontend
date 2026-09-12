import assert from "node:assert/strict";
import test from "node:test";
import {
  canHaveInstructorProfile,
  getDashboardPathByRole,
  isInstructor,
} from "../src/utils/roles.js";
import {
  normalizeEarningsCourses,
  normalizeEarningsHistory,
  normalizeEarningsSummary,
  normalizeEarningsTimeline,
} from "../src/features/instructor-earnings/api/earningsApi.js";
import { formatMoney } from "../src/utils/currencyDisplay.js";
import { normalizeInstructorBalance } from "../src/features/instructor-payouts/api/payoutsApi.js";
import {
  canRequestWithdrawal,
  withdrawableBalances,
} from "../src/features/instructor-payouts/payoutPolicy.js";
import {
  getNotificationPresentation,
  getNotificationTypeLabel,
  extractNotificationList,
  isNotificationRead,
  NOTIFICATION_TYPES,
} from "../src/utils/notificationTypes.js";
import { getNotificationTarget } from "../src/utils/notificationTarget.js";

const activeAccount = {
  registrationStatus: "active",
  status: "active",
  isActive: true,
};

test("detects both supported instructor account shapes and rejects role alone", () => {
  const userInstructor = { ...activeAccount, role: "user", instructorId: "instructor-1" };
  const teacherInstructor = { ...activeAccount, role: "teacher", accountType: "instructor" };

  assert.equal(canHaveInstructorProfile(userInstructor), true);
  assert.equal(isInstructor(userInstructor), true);
  assert.equal(isInstructor(teacherInstructor), true);
  assert.equal(isInstructor({ ...activeAccount, role: "teacher" }), false);
  assert.equal(isInstructor({ ...activeAccount, role: "student", instructorId: "instructor-1" }), false);
  assert.equal(getDashboardPathByRole(userInstructor), "/teacher/earnings");
});

test("normalizes empty earnings responses without inventing financial values", () => {
  assert.deepEqual(normalizeEarningsSummary({ data: { data: {} } }), {
    salesCount: 0,
    coursesSold: 0,
    currencies: [],
  });
  assert.deepEqual(normalizeEarningsCourses({ data: {} }), []);
  assert.deepEqual(normalizeEarningsTimeline({ data: {} }), []);
});

test("preserves separate currencies in summaries and display formatting", () => {
  const summary = normalizeEarningsSummary({
    data: {
      salesCount: 3,
      coursesSold: 2,
      byCurrency: { EGP: 1250, USD: 40 },
    },
  });

  assert.deepEqual(summary.currencies, [
    { currency: "EGP", amount: 1250 },
    { currency: "USD", amount: 40 },
  ]);
  assert.match(formatMoney(1250, "EGP"), /EGP$/);
  assert.match(formatMoney(40, "USD"), /USD$/);
  assert.notEqual(formatMoney(1250, "EGP"), formatMoney(40, "USD"));
});

test("normalizes server pagination and keeps ledger items on the reported page", () => {
  const result = normalizeEarningsHistory({
    data: {
      items: [{ id: "earning-11", courseTitle: "Course", net: 90, currency: "EGP" }],
      pagination: { page: 2, limit: 10, total: 21, totalPages: 3 },
    },
  });

  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].id, "earning-11");
  assert.deepEqual(result.pagination, { page: 2, limit: 10, total: 21, totalPages: 3 });
});

test("makes a positive recognized balance withdrawable immediately", () => {
  const balances = normalizeInstructorBalance({
    data: { currency: "EGP", available: 250, reserved: 0, paid: 100 },
  });

  assert.equal(canRequestWithdrawal({ balances }), true);
  assert.deepEqual(withdrawableBalances(balances), balances);
  assert.equal(canRequestWithdrawal({ balances, loading: true }), false);
  assert.equal(canRequestWithdrawal({ balances, suspended: true }), false);
});

test("ignores hold-era fields and does not require a release or maturity date", () => {
  const [balance] = normalizeInstructorBalance({
    data: {
      currency: "USD",
      availableAmount: 40,
      reserved: 10,
      paidAmount: 15,
      pending: 99,
      onHold: 99,
      holdAmount: 99,
      held: 99,
      availableAt: "2099-01-01T00:00:00.000Z",
    },
  });

  assert.deepEqual(balance, { currency: "USD", available: 40, reserved: 10, paid: 15 });
  assert.equal("pending" in balance, false);
  assert.equal(canRequestWithdrawal({ balances: [balance] }), true);
});

test("keeps reserved money separate as an active-withdrawal reservation", () => {
  const [balance] = normalizeInstructorBalance({
    data: { currency: "EGP", available: 0, reservedAmount: 300, totalPaid: 500 },
  });

  assert.deepEqual(balance, { currency: "EGP", available: 0, reserved: 300, paid: 500 });
  assert.equal(canRequestWithdrawal({ balances: [balance] }), false);
});

test("provides Arabic and English presentation for every financial and course notification", () => {
  for (const type of NOTIFICATION_TYPES) {
    const arabic = getNotificationPresentation({ type }, "ar");
    const english = getNotificationPresentation({ type }, "en");
    assert.notEqual(arabic.title, "إشعار جديد", type);
    assert.notEqual(english.title, "New notification", type);
    assert.ok(arabic.description);
    assert.ok(english.description);
  }
});

test("uses the event key when the backend type is only a category", () => {
  const presentation = getNotificationPresentation({
    type: "system",
    key: "WITHDRAWAL_APPROVED",
  }, "en");
  assert.equal(presentation.title, "Withdrawal approved");
});

test("renders unknown notifications with a safe localized fallback", () => {
  assert.equal(getNotificationTypeLabel("UNKNOWN_EVENT", "ar"), "إشعار جديد");
  assert.equal(getNotificationTypeLabel("UNKNOWN_EVENT", "en"), "New notification");
  assert.equal(getNotificationPresentation({}, "ar").kind, "unknown");
});

test("routes new notifications to safe existing pages and tolerates deleted entities", () => {
  assert.equal(getNotificationTarget({ type: "COURSE_PURCHASE_SUCCESS", data: { courseId: "course-1" } }, "student"), "/learn/course-1");
  assert.equal(getNotificationTarget({ type: "CERTIFICATE_ISSUED", courseId: "course-1" }, "student"), "/certificate/course-1");
  assert.equal(getNotificationTarget({ type: "QUIZ_PASSED" }, "student"), "/student-dashboard/courses");
  assert.equal(getNotificationTarget({ type: "NEW_COURSE_REVIEW", courseId: "course-1" }, "teacher"), "/teacher/courses/course-1");
  assert.equal(getNotificationTarget({ type: "WITHDRAWAL_PAID" }, "teacher"), "/teacher/earnings");
  assert.equal(getNotificationTarget({ type: "NEW_WITHDRAWAL_REQUEST" }, "admin"), "/admin/course-finances");
  assert.equal(getNotificationTarget({ type: "CERTIFICATE_ISSUED" }, "student"), "/student-dashboard/courses");
});

test("normalizes unread and read representations without treating missing state as read", () => {
  assert.equal(isNotificationRead({ isRead: true }), true);
  assert.equal(isNotificationRead({ read: true }), true);
  assert.equal(isNotificationRead({ status: "read" }), true);
  assert.equal(isNotificationRead({}), false);
});

test("extracts notification lists from paginated responses", () => {
  const items = [{ id: "notification-1" }];
  assert.deepEqual(extractNotificationList({ data: { items, pagination: { page: 1 } } }), items);
  assert.deepEqual(extractNotificationList(undefined), []);
});
