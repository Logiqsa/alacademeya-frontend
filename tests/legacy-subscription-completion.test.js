import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("legacy subscription completion is admin-only UI and parent-safe messaging", async () => {
  const admin = await read("../src/components/admin/subscriptions/tabs/SubscriptionsTab.jsx");
  const form = await read("../src/pages/admin/subscriptions/Addsubscriptionpage.jsx");
  const parent = await read("../src/pages/parent/SubscriptionPage.jsx");
  const app = await read("../src/App.jsx");

  assert.match(admin, /completeLegacy=/);
  assert.match(admin, /بيانات غير مكتملة/);
  assert.match(form, /completeLegacySubscription/);
  assert.match(form, /استكمال بيانات الاشتراك/);
  assert.match(parent, /يرجى التواصل مع الإدارة/);
  assert.match(parent, /بيانات الاشتراك غير مكتملة/);
  assert.match(app, /\["admin", "super-admin"\]\.includes\(user\?\.role\)/);
  assert.doesNotMatch(parent, /duration: "شهر"/);
});
