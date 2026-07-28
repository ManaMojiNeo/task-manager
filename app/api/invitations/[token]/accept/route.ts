import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import * as teamService from "@/services/teamService";
import { ServiceError } from "@/services/taskService";

type Params = { params: Promise<{ token: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
  const { token } = await params;
  try {
    const team = await teamService.acceptInvitation(user.id, user.email, token);
    return NextResponse.json({ team });
  } catch (err) {
    if (err instanceof ServiceError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/invitations/:token/accept]", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 });
  }
}
