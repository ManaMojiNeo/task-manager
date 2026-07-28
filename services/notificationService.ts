import * as notificationRepository from "@/repositories/notificationRepository";

export async function listNotifications(userId: string) {
  const [notifications, unreadCount] = await Promise.all([
    notificationRepository.findNotificationsForUser(userId),
    notificationRepository.countUnread(userId),
  ]);
  return { notifications, unreadCount };
}

export async function markOneRead(userId: string, notificationId: string) {
  await notificationRepository.markRead(notificationId, userId);
}

export async function markAllRead(userId: string) {
  await notificationRepository.markAllRead(userId);
}

/** สร้างแจ้งเตือนเมื่อมีการมอบหมายงานให้สมาชิกคนใหม่ (ไม่แจ้งถ้ามอบหมายให้ตัวเอง) */
export async function notifyTaskAssigned(
  assigneeId: string,
  assignerId: string,
  assignerName: string,
  taskId: string,
  taskTitle: string
) {
  if (assigneeId === assignerId) return;
  await notificationRepository.createNotification({
    userId: assigneeId,
    type: "task_assigned",
    content: `${assignerName} มอบหมายงาน "${taskTitle}" ให้คุณ`,
    relatedTaskId: taskId,
  });
}

/** แจ้งเตือนผู้ที่เกี่ยวข้องกับงาน (ผู้สร้าง + ผู้รับผิดชอบ) เมื่อมีความคิดเห็นใหม่ ยกเว้นผู้ที่คอมเมนต์เอง */
export async function notifyCommentAdded(
  recipientIds: string[],
  commenterId: string,
  commenterName: string,
  taskId: string,
  taskTitle: string
) {
  const targets = [...new Set(recipientIds)].filter((id) => id !== commenterId);
  await Promise.all(
    targets.map((userId) =>
      notificationRepository.createNotification({
        userId,
        type: "comment_added",
        content: `${commenterName} แสดงความคิดเห็นในงาน "${taskTitle}"`,
        relatedTaskId: taskId,
      })
    )
  );
}
