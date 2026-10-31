import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { getUserInitials } from "../src/utils/userInitials.js";

test("avatar initials support one-word and multi-word Arabic and English names", () => {
  assert.equal(getUserInitials("Yara Elalfy"), "YE");
  assert.equal(getUserInitials("Course Learner Account"), "CL");
  assert.equal(getUserInitials("test"), "T");
  assert.equal(getUserInitials("محمد حمد العويني"), "م ح");
  assert.equal(getUserInitials("متعلم"), "م");
  assert.equal(getUserInitials("  "), "؟");
});

test("user tables render initials when no profile image exists", () => {
  const source = fs.readFileSync(
    new URL("../src/components/admin/users/Userstable.jsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /getUserInitials\(name\)/);
  assert.match(source, /avatarUrl \?/);
  assert.doesNotMatch(source, /<User size=/);
});
