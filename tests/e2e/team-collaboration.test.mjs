// tests/e2e/team-collaboration.test.mjs
//
// End-to-End Test: จำลอง Flow การทำงานร่วมกันของทีมทั้งหมด
// ตั้งแต่เชิญสมาชิก มอบหมายงาน แจ้งเตือน จนถึงเปลี่ยนสถานะงาน
// รันจริงกับ Production API (ไม่ได้ Mock คาใดๆ)

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
  if (res.status !== 200) throw new Error(`login failed: ${JSON.stringify(data)}`);
  return data.token;
}

test("E2E: มอบหมายงาน -> แจ้งเตือน -> คอมเมนต์ตอบกลับ -> แจ้งเตือนกลับ -> เปลี่ยนสถานะผ่าน Kanban", async () => {
  const ownerToken = await login("somchai.test@claudebook.dev", "SecurePass123");
  const memberToken = await login("colleague.test@claudebook.dev", "TestPass123!");

     const membersRes = await fetch(`${BASE_URL}/api/team/members`, {
       headers: { Authorization: `Bearer ${ownerToken}` },
     });
  const { members } = await membersRes.json();
  const colleague = members.find((m) => m.user.email === "colleague.test@claudebook.dev");
  assert.ok(colleague, "สมหญิงต้องเป็นสมาชิกทีมอยู่แล้วก่อนรันเทสต์นี้");

     const createRes = await fetch(`${BASE_URL}/api/tasks`, {
       method: "POST",
       headers: { "Content-Type": "application/json", Authorization: `Bearer ${ownerToken}` },
       body: JSON.stringify({
         title: `[E2E Test] งานทดสอบ Flow เต็มรูปแบบ ${Date.now()}`,
         priority: "medium",
         assigneeId: colleague.userId,
       }),
     });
  assert.equal(createRes.status, 201);
  const { task } = await createRes.json();

     await fetch(`${BASE_URL}/api/tasks/${task.id}/comments`, {
       method: "POST",
       headers: { "Content-Type": "application/json", Authorization: `Bearer ${ownerToken}` },
       body: JSON.stringify({ content: "[E2E] ช่วยเริ่มงานนี้ด้วยนะครับ" }),
     });

     const notifRes = await fetch(`${BASE_URL}/api/notifications`, {
       headers: { Authorization: `Bearer ${memberToken}` },
     });
  const { unreadCount } = await notifRes.json();
  assert.ok(unreadCount >= 2, `คาดหวัง unreadCount >= 2 แต่ได้ ${unreadCount}`);

     const taskDetailRes = await fetch(`${BASE_URL}/api/tasks/${task.id}`, {
       headers: { Authorization: `Bearer ${memberToken}` },
     });
  assert.equal(
    taskDetailRes.status,
    200,
    "สมหญิงต้องเปิดงานนี้ได้ แม้ทีมเริ่มต้นของเธอจะเป็นทีมอื่น เพราะเป็นสมาชิกทีมนี้จริง"
    );

     const replyRes = await fetch(`${BASE_URL}/api/tasks/${task.id}/comments`, {
       method: "POST",
       headers: { "Content-Type": "application/json", Authorization: `Bearer ${memberToken}` },
       body: JSON.stringify({ content: "[E2E] รับทราบค่ะ" }),
     });
  assert.equal(replyRes.status, 201);

     const ownerNotifRes = await fetch(`${BASE_URL}/api/notifications`, {
       headers: { Authorization: `Bearer ${ownerToken}` },
     });
  const { unreadCount: ownerUnread } = await ownerNotifRes.json();
  assert.ok(ownerUnread >= 1, "สมชายควรมีแจ้งเตือนอย่างน้อย 1 รายการจากการตอบกลับของสมหญิง");

     const statusRes = await fetch(`${BASE_URL}/api/tasks/${task.id}`, {
       method: "PATCH",
       headers: { "Content-Type": "application/json", Authorization: `Bearer ${ownerToken}` },
       body: JSON.stringify({ status: "in_progress" }),
     });
  assert.equal(statusRes.status, 200);
  const { task: updatedTask } = await statusRes.json();
  assert.equal(updatedTask.status, "in_progress");
});
