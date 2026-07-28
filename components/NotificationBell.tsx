"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getNotifications, markAllNotificationsRead } from "@/lib/api";

type Notification = {
  id: string;
  type: string;
  content: string;
  isRead: boolean;
  relatedTaskId: string | null;
  createdAt: string;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // เงียบไว้ ไม่ต้องรบกวนผู้ใช้ถ้าโหลดแจ้งเตือนไม่สำเร็จ
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    load();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
        aria-label="การแจ้งเตือน"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-sm font-semibold text-zinc-900">การแจ้งเตือน</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                อ่านทั้งหมด
              </button>
            )}
          </div>
          <div className="mt-1 max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-2 py-4 text-center text-sm text-zinc-400">ยังไม่มีการแจ้งเตือน</p>
            )}
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.relatedTaskId ? `/tasks/${n.relatedTaskId}` : "#"}
                onClick={() => setOpen(false)}
                className={`block rounded-lg px-2 py-2 text-sm hover:bg-zinc-50 ${
                  n.isRead ? "text-zinc-500" : "font-medium text-zinc-900"
                }`}
              >
                {n.content}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
