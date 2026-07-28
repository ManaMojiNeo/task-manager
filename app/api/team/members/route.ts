import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import * as teamService from "@/services/teamService";
import { ServiceError } from "@/services/taskService";

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
  try {
    const teamId = req.nextUrl.searchParams.get("teamId");
    const members = await teamService.getTeamMembers(user.id, teamId);
    return NextResponse.json({ members });
  } catch (err) {
    if (err instanceof ServiceError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/team/members]", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 });
  }
}
