"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTasks, getToken, clearToken, ApiError } from "@/lib/api";
import { TaskList } from "@/components/TaskList";
import { TaskForm } from "@/components/TaskForm";

type Task = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "in_review" | "done" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string | null;
};

export default function TasksPage() {
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

  if (error) return <main className="p-8 text-red-600">{error}</main>;
  if (!tasks) return <main className="p-8 text-zinc-500">กำลังโหลด...</main>;

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">รายการงานทั้งหมด</h1>
        <Link href="/dashboard" className="text-sm underline">
          ← กลับ Dashboard
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-[2fr_1fr]">
        <TaskList tasks={tasks} />
        <TaskForm onCreated={load} />
      </div>
    </main>
  );
}
