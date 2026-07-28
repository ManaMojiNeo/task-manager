import { prisma } from "@/lib/prisma";
import { TeamRole } from "@prisma/client";

/** รายชื่อสมาชิกทั้งหมดของทีม พร้อมข้อมูลผู้ใช้ */
export function findTeamMembers(teamId: string) {
  return prisma.teamMember.findMany({
    where: { teamId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { joinedAt: "asc" },
  });
}

export function findTeamById(teamId: string) {
  return prisma.team.findUnique({ where: { id: teamId } });
}

export function createInvitation(data: {
  teamId: string;
  email: string;
  invitedBy: string;
  role: TeamRole;
  token: string;
  expiresAt: Date;
}) {
  return prisma.invitation.create({ data });
}

export function findInvitationByToken(token: string) {
  return prisma.invitation.findUnique({ where: { token } });
}

/** คำเชิญที่ยังรอตอบรับทั้งหมดของอีเมลหนึ่ง พร้อมชื่อทีมที่เชิญ */
export function findPendingInvitationsForEmail(email: string) {
  return prisma.invitation.findMany({
    where: { email, status: "pending" },
    include: { team: { select: { id: true, name: true } }, inviter: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export function markInvitationStatus(id: string, status: "accepted" | "declined" | "expired") {
  return prisma.invitation.update({ where: { id }, data: { status } });
}

export function addTeamMember(teamId: string, userId: string, role: TeamRole) {
  return prisma.teamMember.upsert({
    where: { teamId_userId: { teamId, userId } },
    update: {},
    create: { teamId, userId, role },
  });
}
