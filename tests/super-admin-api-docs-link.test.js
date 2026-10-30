import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(
  new URL(
    "../src/components/admin/account-settings/AdminAccountSettings.jsx",
    import.meta.url,
  ),
  "utf8",
);

test("settings exposes API docs only to the super-admin", () => {
  assert.match(source, /admin\.role === "super-admin"/);
  assert.match(source, />API Docs</);
  assert.match(source, /API_BASE_URL\.replace/);
  assert.match(source, /\/api-docs/);
  assert.match(source, /target="_blank"/);
});
