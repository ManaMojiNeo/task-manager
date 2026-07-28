// tests/integration/tasks.test.mjs
//
// Integration Test: เรียก API จริงที่ Deploy อยู่บน Vercel
// (ไม่ใช่ Mock — ทดสอบกับ Production Endpoint จริงและฐานข้อมูล Neon จริง)

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
  return { status: res.status, token: data.token };
}

test("เข้าสู่ระบบด้วยบัญชีที่มีอยู่จริง ต้องได้ status 200 พร้อม token", async () => {
  const { status, token } = await login("somchai.test@claudebook.dev", "SecurePass123");
  assert.equal(status, 200);
  assert.ok(token, "ควรได้ token กลับมา");
});

test("เข้าสู่ระบบด้วยรหัสผ่านผิด ต้องได้ status 401", async () => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "somchai.test@claudebook.dev", password: "wrong-password" }),
  });
  assert.equal(res.status, 401);
});

test("สร้างงานโดยไม่ระบุชื่องาน ต้องได้ status 400", async () => {
  const { token } = await login("somchai.test@claudebook.dev", "SecurePass123");
  const res = await fetch(`${BASE_URL}/api/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title: "", priority: "medium" }),
  });
  assert.equal(res.status, 400);
});

test("สร้างงานพร้อมมอบหมายให้สมาชิกในทีม ต้องได้ status 201 และ assignments ต้องมีข้อมูล", async () => {
  const { token } = await login("somchai.test@claudebook.dev", "SecurePass123");

     const membersRes = await fetch(`${BASE_URL}/api/team/members`, {
       headers: { Authorization: `Bearer ${token}` },
     });
  const { members } = await membersRes.json();
  const colleague = members.find((m) => m.user.email === "colleague.test@claudebook.dev");
  assert.ok(colleague, "ควรพบสมหญิงในรายชื่อสมาชิกทีม (ต้องเชิญและตอบรับไว้ล่วงหน้าแล้ว)");

     const createRes = await fetch(`${BASE_URL}/api/tasks`, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
       },
       body: JSON.stringify({
         title: `[Integration Test] งานทดสอบอัตโนมัติ ${Date.now()}`,
         priority: "low",
         assigneeId: colleague.userId,
       }),
     });
  assert.equal(createRes.status, 201);
  const { task } = await createRes.json();
  assert.equal(task.assignments[0].assignee.id, colleague.userId);
});

test("ค้นหางานด้วยคำค้นหาที่ไม่มีอยู่จริง ต้องได้รายการว่าง", async () => {
  const { token } = await login("somchai.test@claudebook.dev", "SecurePass123");
  const res = await fetch(
    `${BASE_URL}/api/tasks?q=${encodeURIComponent("xxxไม่มีงานนี้แน่นอนxxx")}`,
    { headers: { Authorization: `Bearer ${token}` } }
    );
  const { tasks } = await res.json();
  assert.equal(tasks.length, 0);
});

test("กรองงานตามสถานะ 'done' ต้องได้เฉพาะงานที่มีสถานะ done เท่านั้น", async () => {
  const { token } = await login("somchai.test@claudebook.dev", "SecurePass123");
  const res = await fetch(`${BASE_URL}/api/tasks?status=done`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { tasks } = await res.json();
  for (const t of tasks) {
    assert.equal(t.status, "done");
  }
});
