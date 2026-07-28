import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import * as notificationService from "@/services/notificationService";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
  const { id } = await params;
  try {
    await notificationService.markOneRead(user.id, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/notifications/:id]", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 });
  }
}
