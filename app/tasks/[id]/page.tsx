"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getTask, updateTask, getToken, clearToken, ApiError } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { CommentSection } from "@/components/CommentSection";
import { NavBar } from "@/components/NavBar";

type TaskDetail = {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "in_review" | "done" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string | null;
  creator: { id: string; name: string; email: string };
  comments: {
    id: string;
    content: string;
    createdAt: string;
    user: { id: string; name: string };
  }[];
};

const STATUS_OPTIONS = ["todo", "in_progress", "in_review", "done", "archived"];

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getTask(params.id)
      .then((data) => setTask(data.task))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          router.push("/login");
          return;
        }
        setError(err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในระบบ");
      });
  }, [params.id, router]);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    load();
  }, [load, router]);

  async function handleStatusChange(status: string) {
    if (!task) return;
    await updateTask(task.id, { status });
    load();
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <NavBar active="tasks" />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <Link href="/tasks" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          ← กลับรายการงาน
        </Link>
        {error && <p className="mt-4 text-red-600">{error}</p>}
        {!error && !task && <p className="mt-4 text-zinc-500">กำลังโหลด...</p>}
        {task && (
          <>
            <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-xl font-semibold text-zinc-900">{task.title}</h1>
                <StatusBadge status={task.status} />
              </div>
              <p className="mt-2 text-sm text-zinc-500">
                สร้างโดย {task.creator.name} · ความสำคัญ: {task.priority}
                {task.dueDate &&
                  ` · ครบกำหนด: ${new Date(task.dueDate).toLocaleDateString("th-TH")}`}
              </p>
              {task.description && (
                <p className="mt-4 text-zinc-700">{task.description}</p>
              )}

              <div className="mt-5">
                <label className="mb-1 block text-xs font-medium text-zinc-600">
                  เปลี่ยนสถานะ
                </label>
                <select
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <CommentSection taskId={task.id} comments={task.comments} onAdded={load} />
          </>
        )}
      </main>
    </div>
  );
}
