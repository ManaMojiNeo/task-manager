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

/** ดึงรายการงานทั้งหมดของทีมหนึ่ง พร้อมผู้รับผิดชอบ เรียงตามวันครบกำหนดจากใกล้ไปไกล (หัวข้อ 15.3) */
export function findTasksByTeam(teamId: string) {
  return prisma.task.findMany({
    where: { project: { teamId } },
    include: {
      assignments: { include: { assignee: true } },
      creator: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true } },
    },
    orderBy: { dueDate: "asc" },
  });
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
    },
  });
}
