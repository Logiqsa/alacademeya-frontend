import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const table = fs.readFileSync(
  new URL("../src/components/admin/users/Userstable.jsx", import.meta.url),
  "utf8",
);
const notifications = fs.readFileSync(
  new URL("../src/components/admin/notifications/NotificationsSection.jsx", import.meta.url),
  "utf8",
);

test("admin user rows open from blank space without hijacking controls", () => {
  assert.match(table, /event\.target\.closest\("button, a, input, select, textarea"\)/);
  assert.match(table, /handleView\(user\)/);
});

test("parent children open as student details with a back action", () => {
  assert.match(table, /onChildClick\?\.\(child\)/);
  assert.match(table, /setDetailsParent\(detailsUser\)/);
  assert.match(table, /aria-label="الرجوع لولي الأمر"/);
});

test("student details open the linked parent with a back action", () => {
  assert.match(table, /ولي الأمر/);
  assert.match(table, /onParentClick\?\.\(user\.parent\)/);
  assert.match(table, /onParentClick=\{\(parent\) =>/);
});

test("notification labels follow the account role", () => {
  assert.match(notifications, /roleDetailsLabel/);
  assert.match(notifications, /roleDetailsLabel\(loadingUserRole\)/);
  assert.match(notifications, /roleDetailsLabel\(teacherDetails\.rawRole\)/);
});
