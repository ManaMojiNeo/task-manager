// tests/security/security.test.mjs
//
// ทดสอบด้านความปลอดภัยเบื้องต้น กับ API จริงบน Production

import test from "node:test";
import assert from "node:assert/strict";

const BASE_URL = "https://task-manager-theta-blue-61.vercel.app";

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  return data.token;
}

test("เรียก /api/tasks โดยไม่แนบ Token ต้องถูกปฏิเสธด้วย 401", async () => {
  const res = await fetch(`${BASE_URL}/api/tasks`);
  assert.equal(res.status, 401);
});

test("เรียก /api/dashboard ด้วย Token ปลอมที่ format ผิด ต้องถูกปฏิเสธด้วย 401", async () => {
  const res = await fetch(`${BASE_URL}/api/dashboard`, {
    headers: { Authorization: "Bearer this-is-not-a-real-jwt-token" },
  });
  assert.equal(res.status, 401);
});

test("บัญชี A พยายามเปิดงานของบัญชี B ที่ไม่ได้อยู่ทีมเดียวกัน ต้องถูกปฏิเสธ", async () => {
  const token = await login("colleague.test@claudebook.dev", "TestPass123!");
  const res = await fetch(`${BASE_URL}/api/tasks/00000000-0000-0000-0000-000000000000`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.ok(res.status === 404 || res.status === 403, `คาดหวัง 404/403 แต่ได้ ${res.status}`);
});

test("คอมเมนต์ที่มีสคริปต์แทรกเข้ามา ถูกบันทึกตามที่พิมพ์ (raw) แต่ฝั่ง React จะ escape ตอนแสดงผลเสมอ", async () => {
  const token = await login("somchai.test@claudebook.dev", "SecurePass123");

     const createRes = await fetch(`${BASE_URL}/api/tasks`, {
       method: "POST",
       headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
       body: JSON.stringify({ title: `[Security Test] XSS ${Date.now()}`, priority: "low" }),
     });
  const { task } = await createRes.json();

     const payload = '<script>alert("xss")</script>';
  const commentRes = await fetch(`${BASE_URL}/api/tasks/${task.id}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content: payload }),
  });
  assert.equal(commentRes.status, 201);
  const { comment } = await commentRes.json();

     // Backend ไม่ได้ sanitize เนื้อหาก่อนบันทึก (เก็บ raw string ตามที่ส่งมา)
     assert.equal(comment.content, payload);
  // ความปลอดภัยจริงเกิดขึ้นตอนแสดงผลฝั่ง React ({comment.content} ใน JSX)
     // ซึ่ง React escape string ให้อัตโนมัติเสมอ ไม่ render เป็น HTML จริง จึงไม่เกิด XSS
     // แม้ Backend จะไม่ได้ sanitize ก็ตาม — แต่การพึ่งพา React เพียงอย่างเดียวถือเป็นความเสี่ยง
     // หากมีการเพิ่มจุดแสดงผลใหม่ในอนาคตที่ใช้ dangerouslySetInnerHTML โดยไม่ระวัง
});
