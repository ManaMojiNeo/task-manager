import * as teamRepository from "@/repositories/teamRepository";
import * as taskRepository from "@/repositories/taskRepository";
import { ServiceError } from "@/services/taskService";
import { resolveTeamId } from "@/services/taskService";
import { randomUUID } from "crypto";
import { TeamRole } from "@prisma/client";

const INVITE_EXPIRY_DAYS = 7;

export async function getTeamMembers(userId: string, teamId?: string | null) {
  const resolvedTeamId = await resolveTeamId(userId, teamId);
  return teamRepository.findTeamMembers(resolvedTeamId);
}

export async function inviteMember(
  userId: string,
  body: { email?: string; teamId?: string; role?: TeamRole }
) {
  if (!body.email || !body.email.trim()) {
    throw new ServiceError(400, "ต้องระบุอีเมลผู้ที่จะเชิญ");
  }
  const resolvedTeamId = await resolveTeamId(userId, body.teamId);

  // ตรวจสิทธิ์: เฉพาะ owner หรือ team_lead เท่านั้นที่เชิญสมาชิกใหม่ได้
  const membership = await taskRepository.findTeamMembership(userId, resolvedTeamId);
  if (!membership || (membership.role !== "owner" && membership.role !== "team_lead")) {
    throw new ServiceError(403, "เฉพาะเจ้าของทีมหรือหัวหน้าทีมเท่านั้นที่เชิญสมาชิกได้");
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  return teamRepository.createInvitation({
    teamId: resolvedTeamId,
    email: body.email.trim().toLowerCase(),
    invitedBy: userId,
    role: body.role ?? "member",
    token,
    expiresAt,
  });
}

export async function listMyInvitations(email: string) {
  return teamRepository.findPendingInvitationsForEmail(email.toLowerCase());
}

export async function acceptInvitation(userId: string, userEmail: string, token: string) {
  const invitation = await teamRepository.findInvitationByToken(token);
  if (!invitation) throw new ServiceError(404, "ไม่พบคำเชิญนี้");
  if (invitation.status !== "pending") {
    throw new ServiceError(400, "คำเชิญนี้ถูกตอบรับหรือปฏิเสธไปแล้ว");
  }
  if (invitation.expiresAt < new Date()) {
    await teamRepository.markInvitationStatus(invitation.id, "expired");
    throw new ServiceError(400, "คำเชิญนี้หมดอายุแล้ว");
  }
  if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
    throw new ServiceError(403, "คำเชิญนี้ไม่ได้ส่งถึงบัญชีนี้");
  }

  await teamRepository.addTeamMember(invitation.teamId, userId, invitation.role);
  await teamRepository.markInvitationStatus(invitation.id, "accepted");
  return teamRepository.findTeamById(invitation.teamId);
}
