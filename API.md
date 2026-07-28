# Task Manager API Documentation

Base URL (production): `https://task-manager-theta-blue-61.vercel.app`

ทุก Endpoint ที่ต้องเข้าสู่ระบบ ต้องแนบ Header:

```
Authorization: Bearer <token>
```

---

## POST /api/auth/register

สมัครสมาชิกใหม่ พร้อมสร้างทีมและโปรเจกต์เริ่มต้น (`General`) ให้อัตโนมัติ

**Request Body**

```json
{
  "name": "Mana Dev",
  "email": "mana@example.com",
  "password": "SuperSecret123",
  "teamName": "ทีม ClaudeBook"
}
```

**Response 201**

```json
{
  "user": { "id": "uuid", "name": "Mana Dev", "email": "mana@example.com" },
  "team": { "id": "uuid", "name": "ทีม ClaudeBook" },
  "project": { "id": "uuid", "name": "General" },
  "token": "eyJhbGciOi..."
}
```

**Response 400** — อีเมลซ้ำ หรือข้อมูลไม่ครบ:

```json
{ "error": "อีเมลนี้มีผู้ใช้งานแล้ว" }
```

---

## POST /api/auth/login

**Request Body**

```json
{ "email": "mana@example.com", "password": "SuperSecret123" }
```

**Response 200**

```json
{
  "user": { "id": "uuid", "name": "Mana Dev", "email": "mana@example.com" },
  "token": "eyJhbGciOi..."
}
```

**Response 401** — อีเมล/รหัสผ่านผิด:

```json
{ "error": "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }
```

---

## GET /api/tasks

ดึงรายการงานทั้งหมดของทีม เรียงตามวันครบกำหนดจากใกล้ไปไกล

**Query Parameter:** `teamId` (optional — ถ้าไม่ระบุ จะใช้ทีมแรกที่ผู้ใช้เป็นสมาชิก)

**Response 200**

```json
{ "tasks": [ { "id": "uuid", "title": "ออกแบบ Schema", "status": "todo", "priority": "high", "dueDate": "2026-08-01" } ] }
```

---

## POST /api/tasks

**Request Body**

```json
{ "title": "เขียน Backend API", "description": "ทำ CRUD tasks", "priority": "high", "dueDate": "2026-08-05", "teamId": "uuid" }
```

**Response 201:** `{ "task": { ... } }`
**Response 400:** ไม่ได้ระบุ `title`

---

## GET /api/tasks/:id

**Response 200:** รายละเอียดงาน พร้อม comments และผู้รับผิดชอบ
**Response 404:** ไม่พบงาน
**Response 403:** ไม่ใช่สมาชิกของทีมที่งานนี้อยู่

---

## PATCH /api/tasks/:id

**Request Body (ส่งเฉพาะฟิลด์ที่ต้องการแก้)**

```json
{ "status": "in_progress" }
```

**Response 200:** `{ "task": { ... } }`

---

## DELETE /api/tasks/:id

**Response 200:** `{ "success": true }`

---

## POST /api/tasks/:id/comments

**Request Body**

```json
{ "content": "งานนี้รอ Review จากหัวหน้าทีมก่อน" }
```

**Response 201:** `{ "comment": { ... } }`
**Response 400:** ไม่ได้ระบุ `content`

---

## GET /api/dashboard

**Query Parameter:** `teamId` (optional)

**Response 200**

```json
{
  "teamId": "uuid",
  "total": 3,
  "statusCounts": { "todo": 1, "in_progress": 1, "in_review": 0, "done": 1, "archived": 0 },
  "upcoming": [ { "id": "uuid", "title": "...", "dueDate": "2026-08-01", "status": "todo", "priority": "high" } ]
}
```

---

## Error Response ทั่วไป

| Status | ความหมาย | ตัวอย่าง |
|---|---|---|
| 400 | ข้อมูลที่ส่งมาไม่ถูกต้อง/ไม่ครบ | `{ "error": "ต้องระบุชื่องาน (title)" }` |
| 401 | ยังไม่ได้เข้าสู่ระบบ หรือ Token หมดอายุ/ไม่ถูกต้อง | `{ "error": "ไม่ได้เข้าสู่ระบบ" }` |
| 403 | เข้าสู่ระบบแล้วแต่ไม่มีสิทธิ์เข้าถึงข้อมูลนี้ | `{ "error": "คุณไม่ใช่สมาชิกของทีมนี้" }` |
| 404 | ไม่พบข้อมูลที่ร้องขอ | `{ "error": "ไม่พบงานนี้" }` |
| 500 | ข้อผิดพลาดจากระบบ (บันทึก Log ไว้ตรวจสอบภายหลัง) | `{ "error": "เกิดข้อผิดพลาดในระบบ" }` |
