"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getTask, updateTask, getToken, clearToken, ApiError } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { CommentSection } from "@/components/CommentSection";

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

  if (error) return <main className="p-8 text-red-600">{error}</main>;
  if (!task) return <main className="p-8 text-zinc-500">กำลังโหลด...</main>;

  return (
    <main className="mx-auto max-w-2xl p-8">
      <Link href="/tasks" className="text-sm underline">
        ← กลับรายการงาน
      </Link>
      <div className="mt-4 flex items-start justify-between gap-2">
        <h1 className="text-xl font-semibold">{task.title}</h1>
        <StatusBadge status={task.status} />
      </div>
      <p className="mt-2 text-sm text-zinc-500">
        สร้างโดย {task.creator.name} · ความสำคัญ: {task.priority}
        {task.dueDate &&
          ` · ครบกำหนด: ${new Date(task.dueDate).toLocaleDateString("th-TH")}`}
      </p>
      {task.description && <p className="mt-4">{task.description}</p>}

      <div className="mt-4">
        <label className="text-sm text-zinc-500">เปลี่ยนสถานะ: </label>
        <select
          className="rounded border px-2 py-1 text-sm"
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

      <CommentSection taskId={task.id} comments={task.comments} onAdded={load} />
    </main>
  );
}
