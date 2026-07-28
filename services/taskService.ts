import * as taskRepository from "@/repositories/taskRepository";
import { TaskPriority, TaskStatus } from "@prisma/client";

export class ServiceError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** ตรวจสอบว่า userId มีสิทธิ์เข้าถึงทีม teamId จริงหรือไม่ (Authorization) โยน 403 ถ้าไม่ใช่สมาชิก */
async function assertTeamMember(userId: string, teamId: string) {
  const membership = await taskRepository.findTeamMembership(userId, teamId);
  if (!membership) {
    throw new ServiceError(403, "คุณไม่ใช่สมาชิกของทีมนี้");
  }
}

/** ถ้าไม่ได้ระบุ teamId มา ให้ใช้ทีมแรกที่ผู้ใช้เป็นสมาชิกอยู่แทน */
export async function resolveTeamId(userId: string, teamId?: string | null) {
  if (teamId) {
    await assertTeamMember(userId, teamId);
    return teamId;
  }
  const membership = await taskRepository.findFirstTeamForUser(userId);
  if (!membership) {
    throw new ServiceError(404, "ผู้ใช้นี้ยังไม่ได้อยู่ในทีมใดเลย");
  }
  return membership.teamId;
}

export async function getTasksByTeam(userId: string, teamId?: string | null) {
  const resolvedTeamId = await resolveTeamId(userId, teamId);
  return taskRepository.findTasksByTeam(resolvedTeamId);
}

export async function createTask(
  userId: string,
  body: {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: string;
    teamId?: string;
    projectId?: string;
  }
) {
  if (!body.title || !body.title.trim()) {
    throw new ServiceError(400, "ต้องระบุชื่องาน (title)");
  }

  let projectId = body.projectId;
  if (!projectId) {
    const teamId = await resolveTeamId(userId, body.teamId);
    const project = await taskRepository.findFirstProjectForTeam(teamId);
    if (!project) {
      throw new ServiceError(404, "ทีมนี้ยังไม่มีโปรเจกต์ กรุณาสร้างโปรเจกต์ก่อน");
    }
    projectId = project.id;
  }

  return taskRepository.createTask({
    projectId,
    title: body.title.trim(),
    description: body.description,
    priority: body.priority,
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    createdBy: userId,
  });
}

async function getTaskOr404(taskId: string) {
  const task = await taskRepository.findTaskById(taskId);
  if (!task) throw new ServiceError(404, "ไม่พบงานนี้");
  return task;
}

export async function getTaskById(userId: string, taskId: string) {
  const task = await getTaskOr404(taskId);
  await assertTeamMember(userId, task.project.teamId);
  return task;
}

export async function updateTask(
  userId: string,
  taskId: string,
  body: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string | null;
  }
) {
  const task = await getTaskOr404(taskId);
  await assertTeamMember(userId, task.project.teamId);

  return taskRepository.updateTask(taskId, {
    ...(body.title !== undefined && { title: body.title }),
    ...(body.description !== undefined && { description: body.description }),
    ...(body.status !== undefined && { status: body.status }),
    ...(body.priority !== undefined && { priority: body.priority }),
    ...(body.dueDate !== undefined && {
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    }),
  });
}

export async function deleteTask(userId: string, taskId: string) {
  const task = await getTaskOr404(taskId);
  await assertTeamMember(userId, task.project.teamId);
  await taskRepository.deleteTask(taskId);
}

export async function addComment(userId: string, taskId: string, content?: string) {
  if (!content || !content.trim()) {
    throw new ServiceError(400, "ต้องระบุเนื้อหาความคิดเห็น (content)");
  }
  const task = await getTaskOr404(taskId);
  await assertTeamMember(userId, task.project.teamId);
  return taskRepository.createComment(taskId, userId, content.trim());
}

export async function getDashboard(userId: string, teamId?: string | null) {
  const resolvedTeamId = await resolveTeamId(userId, teamId);
  const [statusCounts, upcoming] = await Promise.all([
    taskRepository.countTasksByStatus(resolvedTeamId),
    taskRepository.findUpcomingTasks(resolvedTeamId),
  ]);
  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  return { teamId: resolvedTeamId, total, statusCounts, upcoming };
}
