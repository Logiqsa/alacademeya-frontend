import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const sourceFiles = [
  "../src/components/admin/users/EntityProfileModal.jsx",
  "../src/components/admin/users/Userstable.jsx",
  "../src/components/admin/notifications/NotificationsSection.jsx",
  "../src/pages/admin/teachers/TeachersPage.jsx",
  "../src/components/auth/AuthLayout.jsx",
  "../src/pages/auth/PendingPage.jsx",
  "../src/pages/auth/Teacherstatepage.jsx",
];

const relativeLuminance = (hex) => {
  const channels = hex
    .replace("#", "")
    .match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.03928
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const contrastWithWhite = (hex) =>
  1.05 / (relativeLuminance(hex) + 0.05);

test("success and teal action colors remain readable with white text", () => {
  assert.ok(contrastWithWhite("#087A35") >= 4.5);
  assert.ok(contrastWithWhite("#087F73") >= 4.5);
});

test("prominent green actions no longer use the low-contrast WhatsApp green", () => {
  const combinedSource = sourceFiles
    .map((file) => fs.readFileSync(new URL(file, import.meta.url), "utf8"))
    .join("\n");

  assert.doesNotMatch(combinedSource, /#25D366|#20bd5a|#1ebe5d/i);
  assert.match(combinedSource, /#087A35|bg-emerald-700/);
});
