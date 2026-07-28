import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import * as taskService from "@/services/taskService";
import { ServiceError } from "@/services/taskService";
import type { TaskFilters } from "@/repositories/taskRepository";

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
  }
  try {
    const params = req.nextUrl.searchParams;
    const teamId = params.get("teamId");
    const filters: TaskFilters = {
      q: params.get("q") ?? undefined,
      status: (params.get("status") as TaskFilters["status"]) ?? undefined,
      priority: (params.get("priority") as TaskFilters["priority"]) ?? undefined,
      assigneeId: params.get("assigneeId") ?? undefined,
      sortBy: (params.get("sortBy") as TaskFilters["sortBy"]) ?? undefined,
      order: (params.get("order") as TaskFilters["order"]) ?? undefined,
    };
    const tasks = await taskService.getTasksByTeam(user.id, teamId, filters);
    return NextResponse.json({ tasks });
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[GET /api/tasks]", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const task = await taskService.createTask(user.id, body);
    return NextResponse.json({ task }, { status: 201 });
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[POST /api/tasks]", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 });
  }
}
