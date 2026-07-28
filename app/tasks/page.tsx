"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getTasks, getToken, clearToken, ApiError } from "@/lib/api";
import { TaskList } from "@/components/TaskList";
import { TaskForm } from "@/components/TaskForm";
import { NavBar } from "@/components/NavBar";

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

  return (
    <div className="min-h-screen bg-zinc-50">
      <NavBar active="tasks" />
      <main className="mx-auto max-w-5xl px-6 py-10">
        {error && <p className="text-red-600">{error}</p>}
        {!error && !tasks && <p className="text-zinc-500">กำลังโหลด...</p>}
        {tasks && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              รายการงานทั้งหมด
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              จัดการงานของทีมและติดตามความคืบหน้า
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-[2fr_1fr]">
              <TaskList tasks={tasks} />
              <TaskForm onCreated={load} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
