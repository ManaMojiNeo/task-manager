import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, teamName } = body ?? {};

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "ต้องระบุ name, email และ password ให้ครบ" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "อีเมลนี้มีผู้ใช้งานแล้ว" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    // สมัครสมาชิกใหม่ พร้อมสร้างทีมและโปรเจกต์เริ่มต้นให้ทันที
    // เพื่อให้ผู้ใช้เริ่มสร้างงานได้เลยโดยไม่ต้องผ่านขั้นตอนตั้งทีมแยกต่างหากก่อน
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, passwordHash },
      });

      const team = await tx.team.create({
        data: {
          name: teamName?.trim() || `ทีมของ ${name}`,
          ownerId: user.id,
        },
      });

      await tx.teamMember.create({
        data: { teamId: team.id, userId: user.id, role: "owner" },
      });

      const project = await tx.project.create({
        data: { teamId: team.id, name: "General", createdBy: user.id },
      });

      return { user, team, project };
    });

    const token = signToken({
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
    });

    return NextResponse.json(
      {
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
        team: { id: result.team.id, name: result.team.name },
        project: { id: result.project.id, name: result.project.name },
        token,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
