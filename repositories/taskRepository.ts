import { prisma } from "@/lib/prisma";
import { Prisma, TaskPriority, TaskStatus } from "@prisma/client";

/** ตรวจว่า userId เป็นสมาชิกของทีม teamId จริงหรือไม่ (ใช้ในชั้น Service สำหรับ Authorization) */
export function findTeamMembership(userId: string, teamId: string) {
  return prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  });
}

/** ทีมแรกที่ผู้ใช้เป็นสมาชิกอยู่ ใช้เป็นค่า default เมื่อไม่ได้ระบุ teamId มา */
export function findFirstTeamForUser(userId: string) {
  return prisma.teamMember.findFirst({
    where: { userId },
    include: { team: true },
    orderBy: { joinedAt: "asc" },
  });
}

/** โปรเจกต์แรกของทีม ใช้เป็น default project ตอนสร้างงานใหม่ถ้าไม่ได้ระบุ projectId มา */
export function findFirstProjectForTeam(teamId: string) {
  return prisma.project.findFirst({
    where: { teamId },
    orderBy: { createdAt: "asc" },
  });
}

export type TaskFilters = {
  q?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  sortBy?: "dueDate" | "priority" | "createdAt" | "title";
  order?: "asc" | "desc";
};

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  low: 0,
  medium: 1,
  high: 2,
  urgent: 3,
};

/** ดึงรายการงานทั้งหมดของทีมหนึ่ง รองรับค้นหา/กรอง/เรียงลำดับ (หัวข้อ 16.5 เพิ่มเติม) */
export async function findTasksByTeam(teamId: string, filters: TaskFilters = {}) {
  const where: Prisma.TaskWhereInput = { project: { teamId } };

  if (filters.q && filters.q.trim()) {
    where.title = { contains: filters.q.trim(), mode: "insensitive" };
  }
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.assigneeId) {
    where.assignments = { some: { userId: filters.assigneeId } };
  }

  const orderBy: Prisma.TaskOrderByWithRelationInput =
    filters.sortBy === "title"
      ? { title: filters.order ?? "asc" }
      : filters.sortBy === "createdAt"
      ? { createdAt: filters.order ?? "desc" }
      : filters.sortBy === "priority"
      ? { dueDate: "asc" } // priority ไม่เรียงลำดับผ่าน DB โดยตรง จะ sort ซ้ำในหน่วยความจำด้านล่าง
      : { dueDate: filters.order ?? "asc" };

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignments: { include: { assignee: true } },
      creator: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true } },
    },
    orderBy,
  });

  if (filters.sortBy === "priority") {
    const dir = filters.order === "asc" ? 1 : -1;
    tasks.sort((a, b) => (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]) * dir);
  }

  return tasks;
}

export function findTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      project: { include: { team: true } },
      assignments: { include: { assignee: true } },
      creator: { select: { id: true, name: true, email: true } },
      comments: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export function createTask(data: {
  projectId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date;
  createdBy: string;
}) {
  return prisma.task.create({ data });
}

export function updateTask(
  id: string,
  data: Prisma.TaskUpdateInput
) {
  return prisma.task.update({ where: { id }, data });
}

export function deleteTask(id: string) {
  return prisma.task.delete({ where: { id } });
}

/** มอบหมายงานให้สมาชิกคนเดียว (แทนที่ผู้รับผิดชอบเดิมถ้ามี) */
export async function assignTask(taskId: string, assigneeId: string, assignedBy: string) {
  await prisma.taskAssignment.deleteMany({ where: { taskId } });
  return prisma.taskAssignment.create({
    data: { taskId, userId: assigneeId, assignedBy },
  });
}

export function unassignTask(taskId: string) {
  return prisma.taskAssignment.deleteMany({ where: { taskId } });
}

export function createComment(taskId: string, userId: string, content: string) {
  return prisma.comment.create({
    data: { taskId, userId, content },
    include: { user: { select: { id: true, name: true } } },
  });
}

/** นับจำนวนงานแยกตามสถานะ สำหรับหน้า Dashboard (หัวข้อ 15.3 + ตัวอย่างประกอบ) */
export async function countTasksByStatus(teamId: string) {
  const grouped = await prisma.task.groupBy({
    by: ["status"],
    where: { project: { teamId } },
    _count: { _all: true },
  });
  const counts: Record<TaskStatus, number> = {
    todo: 0,
    in_progress: 0,
    in_review: 0,
    done: 0,
    archived: 0,
  };
  for (const g of grouped) counts[g.status] = g._count._all;
  return counts;
}

/** งานที่ใกล้ครบกำหนดที่สุด 5 อันดับแรก (ยังไม่เสร็จ) สำหรับหน้า Dashboard */
export function findUpcomingTasks(teamId: string) {
  return prisma.task.findMany({
    where: {
      project: { teamId },
      status: { notIn: ["done", "archived"] },
      dueDate: { not: null },
    },
    orderBy: { dueDate: "asc" },
    take: 5,
    select: {
      id: true,
      title: true,
      dueDate: true,
      status: true,
      priority: true,
      assignments: {
        select: { assignee: { select: { id: true, name: true } } },
      },
    },
  });
}
