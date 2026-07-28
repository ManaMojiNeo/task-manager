import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import * as taskService from "@/services/taskService";
import { ServiceError } from "@/services/taskService";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const task = await taskService.getTaskById(user.id, id);
    return NextResponse.json({ task });
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[GET /api/tasks/:id]", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const task = await taskService.updateTask(user.id, id, body);
    return NextResponse.json({ task });
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[PATCH /api/tasks/:id]", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await taskService.deleteTask(user.id, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[DELETE /api/tasks/:id]", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 });
  }
}
