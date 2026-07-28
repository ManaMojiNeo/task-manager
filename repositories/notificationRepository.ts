import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

export function createNotification(data: {
  userId: string;
  type: NotificationType;
  content: string;
  relatedTaskId?: string;
}) {
  return prisma.notification.create({ data });
}

/** แจ้งเตือนล่าสุด 20 รายการของผู้ใช้ ใหม่สุดก่อน */
export function findNotificationsForUser(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export function countUnread(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export function markRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}

export function markAllRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
