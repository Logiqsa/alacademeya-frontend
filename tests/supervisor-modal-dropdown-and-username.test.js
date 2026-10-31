import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(
  new URL(
    "../src/components/admin/supervisors/AddSupervisorModal.jsx",
    import.meta.url,
  ),
  "utf8",
);
const supervisorsPage = fs.readFileSync(
  new URL("../src/pages/admin/supervisors/SupervisorsPage.jsx", import.meta.url),
  "utf8",
);

test("country dropdown is portaled outside the scrollable supervisor modal", () => {
  assert.match(source, /import \{ createPortal \} from "react-dom"/);
  assert.match(source, /createPortal\(/);
  assert.match(source, /position: "fixed"/);
  assert.match(source, /document\.body/);
});

test("supervisor username is visible, editable and sent explicitly", () => {
  assert.match(source, /username: ""/);
  assert.match(source, /label="اسم المستخدم"/);
  assert.match(source, /if \(!data\.username\.trim\(\)\)/);
  assert.match(source, /username: data\.username/);
  assert.match(source, /اسم المستخدم مستخدم بالفعل، اختر اسمًا آخر/);
  assert.match(source, /رقم الهاتف مستخدم بالفعل لحساب آخر/);
  assert.match(source, /البريد الإلكتروني مستخدم بالفعل لحساب آخر/);
  assert.match(supervisorsPage, /username: u\.username/);
});
