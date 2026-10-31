import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const table = readFileSync(
  new URL("../src/components/admin/users/Userstable.jsx", import.meta.url),
  "utf8",
);

test("user actions put primary actions first and destructive actions last", () => {
  const menu = table.slice(
    table.indexOf("const ActionsMenu"),
    table.indexOf("const handleToggleMenu"),
  );

  assert.ok(menu.indexOf('key: "approve"') < menu.indexOf('key: "view"'));
  assert.ok(menu.indexOf('key: "view"') < menu.indexOf('key: "suspend"'));
  assert.ok(menu.indexOf('key: "activate"') < menu.indexOf('key: "delete"'));
  assert.ok(menu.indexOf('key: "suspend"') < menu.indexOf('key: "delete"'));
});

test("student action menus exclude WhatsApp", () => {
  assert.match(table, /!String\(user\.role \|\| ""\)\.startsWith\("طالب"\)/);
});
