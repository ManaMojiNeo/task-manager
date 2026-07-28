"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTasks, updateTask, getToken, clearToken, ApiError } from "@/lib/api";
import { KanbanBoard } from "@/components/KanbanBoard";
import { NavBar } from "@/components/NavBar";

type Task = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "in_review" | "done" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string | null;
  assignments?: { assignee: { id: string; name: string } }[];
};

export default function BoardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getTasks()
      .then((data) => setTasks(data.tasks))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          router.push("/login");
          return;
        }
        setError(err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในระบบ");
      });
  }, [router]);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    load();
  }, [load, router]);

  async function handleStatusChange(taskId: string, status: string) {
    if (!tasks) return;
    // อัปเดตหน้าจอทันทีก่อน (Optimistic Update) แล้วค่อยยืนยันกับ Backend
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: status as Task["status"] } : t)));
    try {
      await updateTask(taskId, { status });
    } catch {
      load(); // ถ้า Backend ปฏิเสธ ให้โหลดข้อมูลจริงกลับมาแทน
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <NavBar active="board" />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Kanban Board</h1>
            <p className="mt-1 text-sm text-zinc-500">ลากการ์ดเพื่อเปลี่ยนสถานะงาน</p>
          </div>
          <Link
            href="/tasks"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            ← ดูแบบรายการ
          </Link>
        </div>

        {error && <p className="mt-4 text-red-600">{error}</p>}
        {!error && !tasks && <p className="mt-4 text-zinc-500">กำลังโหลด...</p>}
        {tasks && (
          <div className="mt-8">
            <KanbanBoard tasks={tasks} onStatusChange={handleStatusChange} />
          </div>
        )}
      </main>
    </div>
  );
}
