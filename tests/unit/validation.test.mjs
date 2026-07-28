// tests/unit/validation.test.mjs
//
// Unit test สำหรับ Logic ตรวจสอบความถูกต้องของฟอร์มสร้างงาน
// Logic นี้คัดลอกมาจาก components/TaskForm.tsx ของจริง (ฟังก์ชัน handleSubmit)
// เพื่อทดสอบแบบแยกส่วน (Unit Test) โดยไม่ต้องพึ่งพา Database หรือ Network

import test from "node:test";
import assert from "node:assert/strict";

// --- Logic จริงจาก components/TaskForm.tsx (คัดลอกมาเพื่อทดสอบแยกส่วน) ---
function validateTaskForm({ title, dueDate }) {
if (!title.trim()) {
return { valid: false, error: "ต้องระบุชื่องาน" };
}
if (dueDate && new Date(dueDate) < new Date(new Date().toDateString())) {
return { valid: false, error: "วันครบกำหนดต้องเป็นวันในอนาคต" };
}
return { valid: true, error: null };
}

test("ชื่องานว่างเปล่า ต้องถูกปฏิเสธ", () => {
const result = validateTaskForm({ title: "", dueDate: "" });
assert.equal(result.valid, false);
assert.equal(result.error, "ต้องระบุชื่องาน");
});

test("ชื่องานมีแต่ช่องว่าง (whitespace) ต้องถูกปฏิเสธเหมือนค่าว่าง", () => {
const result = validateTaskForm({ title: "   ", dueDate: "" });
assert.equal(result.valid, false);
});

test("วันครบกำหนดเป็นวันในอดีต ต้องถูกปฏิเสธ", () => {
const result = validateTaskForm({ title: "งานทดสอบ", dueDate: "2020-01-01" });
assert.equal(result.valid, false);
assert.equal(result.error, "วันครบกำหนดต้องเป็นวันในอนาคต");
});

test("วันครบกำหนดเป็นวันนี้ ต้องผ่าน (ไม่ถือว่าเป็นอดีต)", () => {
const today = new Date().toISOString().split("T")[0];
const result = validateTaskForm({ title: "งานทดสอบ", dueDate: today });
assert.equal(result.valid, true);
});

test("ข้อมูลถูกต้องครบถ้วน (มีชื่องาน ไม่มีวันครบกำหนด) ต้องผ่าน", () => {
const result = validateTaskForm({ title: "ออกแบบหน้า Dashboard", dueDate: "" });
assert.equal(result.valid, true);
assert.equal(result.error, null);
});

test("ข้อมูลถูกต้องครบถ้วน (มีทั้งชื่องานและวันครบกำหนดในอนาคต) ต้องผ่าน", () => {
const future = new Date();
future.setDate(future.getDate() + 30);
const result = validateTaskForm({
title: "เขียนเอกสาร API",
dueDate: future.toISOString().split("T")[0],
});
assert.equal(result.valid, true);
});
