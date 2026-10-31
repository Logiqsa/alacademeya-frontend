import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("account-specific admin pages label incomplete profiles without hiding them", async () => {
  const users = await read("../src/pages/admin/users/Userspage.jsx");
  const supervisors = await read("../src/pages/admin/supervisors/SupervisorsPage.jsx");
  const supervisorFilters = await read("../src/components/admin/supervisors/SupervisorsFilters.jsx");
  const notifications = await read("../src/components/admin/notifications/NotificationsSection.jsx");

  assert.match(users, /hasIncompleteRegistration\(rawUser\)/);
  assert.match(users, /status: "ملف غير مكتمل"/);
  assert.match(supervisors, /hasIncompleteRegistration\(u\)/);
  assert.match(supervisors, /"ملف غير مكتمل"/);
  assert.match(supervisorFilters, /"ملف غير مكتمل"/);
  assert.match(notifications, /isProfileIncomplete/);
  assert.match(notifications, /لم يستكمل المستخدم جميع بيانات ملفه/);
  assert.match(notifications, /role="status"/);
  assert.match(notifications, /phone: notificationData\.phone/);
  assert.match(notifications, /email: notificationData\.email/);
  assert.match(
    notifications,
    /!isUserDetailsNotification\(n\) && getNotificationTarget\(n, "admin"\)/,
  );
  assert.match(notifications, /if \(!notification\.isRead\) await toggleRead\(notification\);/);
});

test("user status filters follow the selected user type", async () => {
  const users = await read("../src/pages/admin/users/Userspage.jsx");
  const filters = await read("../src/components/admin/users/Usersfilters.jsx");

  assert.match(users, /filterRole === "جميع المستخدمين" \|\| user\.role === filterRole/);
  assert.match(users, /statusOptions=\{statusOptions\}/);
  assert.match(filters, /\["جميع الحالات", \.\.\.statusOptions\]/);
});

test("parent details show linked children without placeholder data", async () => {
  const mapper = await read("../src/utils/adminUser.js");
  const table = await read("../src/components/admin/users/Userstable.jsx");

  assert.match(mapper, /children: Array\.isArray\(u\.children\)/);
  assert.match(table, /user\.children\.map\(\(child\) => \(/);
  assert.match(table, /onChildClick\?\.\(child\)/);
  assert.match(table, /لا يوجد أبناء مرتبطون/);
  assert.doesNotMatch(table, /علي محمد/);
});
