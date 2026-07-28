import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import * as teamService from "@/services/teamService";

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
  try {
    const invitations = await teamService.listMyInvitations(user.email);
    return NextResponse.json({ invitations });
  } catch (err) {
    console.error("[GET /api/invitations]", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 });
  }
}
