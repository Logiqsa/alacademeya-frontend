import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("teacher group students use only the classroom-scoped student endpoint", async () => {
  const source = await read("../src/pages/teacher/groups/GroupStudentsPage.jsx");

  assert.match(source, /getClassroomStudents\(groupId\)/);
  assert.doesNotMatch(source, /getAllStudents/);
  assert.match(source, /entry\.createdAt/);
  assert.match(source, /entry\.averageScore/);
  assert.match(source, /entry\.totalStudySessions/);
});

test("teacher group students map current and legacy student statuses to existing badges", async () => {
  const source = await read("../src/pages/teacher/groups/GroupStudentsPage.jsx");

  assert.match(source, /case "approved":\s*return "نشط"/);
  assert.match(source, /case "rejected":\s*return "مستبعد"/);
  assert.match(source, /case "pending":[\s\S]*case "suspended":[\s\S]*return "معلق"/);
  assert.match(source, /case "active":[\s\S]*return "نشط"/);
  assert.match(source, /case "removed":[\s\S]*return "مستبعد"/);
});

test("student and parent add-subject flow uses ownership-validated subscription options", async () => {
  const source = await read("../src/pages/subscription/AddSubjectPage.jsx");

  assert.match(source, /getStudentSubscriptionOptions\(studentId\)/);
  assert.match(source, /const profile = options\?\.student/);
  assert.doesNotMatch(source, /\bgetStudent\s*\(/);
  assert.doesNotMatch(source, /\bgetStudent\s*,/);
});

test("administrative student and subscription callers retain their API contracts", async () => {
  const api = await read("../src/services/APIService.js");

  assert.match(api, /API\.get\("\/students", \{ params \}\)/);
  assert.match(api, /API\.get\(`\/students\/\$\{studentId\}`\)/);
  assert.match(api, /API\.patch\(`\/students\/\$\{studentId\}`, payload\)/);
  assert.match(api, /API\.get\("\/subscriptions\/", \{ params \}\)/);
  assert.match(api, /API\.get\(`\/subscriptions\/\$\{id\}`\)/);
});

test("admin user management stays within its authorized profile endpoints", async () => {
  const source = await read("../src/pages/admin/users/Userspage.jsx");

  assert.match(source, /const currentRole = currentUser\?\.role/);
  assert.match(source, /const canReadAllUsers = \["admin", "super-admin"\]\.includes\(currentRole\)/);
  assert.match(
    source,
    /canReadAllUsers \? fetchAllAdminUsers\(\) : Promise\.resolve\(\[\]\)/,
  );
  assert.match(source, /if \(canReadAllUsers && missingUserIds\.length\)/);
  assert.match(source, /\[\.\.\.studentProfiles, \.\.\.teacherProfiles\]/);
});

test("admin registration notifications use scoped profiles and keep every account state visible", async () => {
  const dashboard = await read("../src/components/admin/dashboard/NotificationsSection.jsx");
  const notifications = await read("../src/components/admin/notifications/NotificationsSection.jsx");

  assert.doesNotMatch(dashboard, /filterIncompleteJoinNotifications/);
  assert.doesNotMatch(notifications, /\bgetUsers\b/);
  assert.match(notifications, /getTeachers\(\{ page: 1, limit: 1000 \}\)/);
  assert.match(notifications, /getAllStudents\(\{ page: 1, limit: 1000 \}\)/);
  assert.match(notifications, /const user = matchedUser \|\|/);
  assert.match(notifications, /notificationUserRole\(notification\) \|\| "user"/);
  const page = await read("../src/pages/admin/notifications/Notifications.jsx");
  const sidebarUnread = await read("../src/api/useSidebarUnread.js");
  assert.doesNotMatch(page, /filterIncompleteJoinNotifications/);
  assert.doesNotMatch(sidebarUnread, /filterIncompleteJoinNotifications/);
});

test("admin message and supervisor screens keep directory-only actions super-admin scoped", async () => {
  const messages = await read("../src/pages/admin/messages/Adminmessages.jsx");
  const conversations = await read("../src/components/admin/messages/Conversationslist.jsx");
  const chatbox = await read("../src/components/admin/messages/Chatbox.jsx");
  const supervisors = await read("../src/pages/admin/supervisors/SupervisorsPage.jsx");
  const groups = await read("../src/pages/admin/groups/Groupspage.jsx");
  const app = await read("../src/App.jsx");

  assert.match(messages, /const isSuperAdmin = user\?\.role === "super-admin"/);
  assert.match(messages, /if \(!isSuperAdmin\) \{[\s\S]*return undefined/);
  assert.match(messages, /canCreateDirectoryChat=\{isSuperAdmin\}/);
  assert.match(messages, /canManageUser=\{isSuperAdmin\}/);
  assert.match(conversations, /mode === "chat" && canCreateDirectoryChat/);
  assert.match(chatbox, /disabled=\{!canManageUser \|\| userPopupLoading\}/);
  assert.match(supervisors, /if \(user\?\.role !== "super-admin"\)/);
  assert.doesNotMatch(groups, /\bgetUser\(/);
  assert.match(groups, /getTeachers\(\{ page: 1, limit: 1000 \}\)/);
  assert.match(app, /user\?\.role === "super-admin"[\s\S]*<SupervisorsPage/);
});

test("shared admin sidebar reads notifications without enumerating the user directory", async () => {
  const sidebarUnread = await read("../src/api/useSidebarUnread.js");

  assert.doesNotMatch(sidebarUnread, /\bgetUsers\b/);
  assert.match(sidebarUnread, /getNotifications\(\)/);
});

test("password-reset client follows the OTP and reset-token API contract", async () => {
  const api = await read("../src/services/APIService.js");
  const page = await read("../src/pages/auth/ForgotPassword.jsx");

  assert.match(api, /verifyPasswordResetCode = \(\{ email, resetCode \}\)/);
  assert.match(api, /resetPassword = \(\{ resetToken, newPassword \}\)/);
  assert.match(page, /verifyPasswordResetCode\(\{ email, resetCode: code \}\)/);
  assert.match(page, /response\.data\?\.data\?\.resetToken/);
  assert.match(page, /resetPassword\(\{[\s\S]*resetToken,[\s\S]*newPassword: password/);
});
