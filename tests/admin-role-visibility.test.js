import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("ordinary admins do not see super-admin navigation and package management", () => {
  const sidebar = read("../src/components/admin/layout/AdminSidebar.jsx");
  const subscriptions = read(
    "../src/pages/admin/subscriptions/SubscriptionsPage.jsx",
  );

  assert.match(sidebar, /superAdminOnly: true/);
  assert.match(sidebar, /user\?\.role === "super-admin"/);
  assert.match(subscriptions, /tab\.key !== "packages"/);
});

test("saved academic structure delete actions are limited to super admins", () => {
  const dashboard = read(
    "../src/components/admin/curriculum/AcademicStructureSection.jsx",
  );
  const editor = read("../src/pages/admin/curriculum/CreateCurriculumPage.jsx");

  assert.match(dashboard, /const canDelete = user\?\.role === "super-admin"/);
  assert.match(dashboard, /onDelete=\{canDelete \? handleDelete : undefined\}/);
  assert.match(editor, /const canDeleteSavedStructure = user\?\.role === "super-admin"/);
  assert.match(editor, /return canDeleteSavedStructure \|\| !isSaved/);
});
