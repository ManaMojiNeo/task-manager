"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getTasks,
  getTeamMembers,
  getToken,
  clearToken,
  ApiError,
  type TaskFilters as TaskFiltersType,
} from "@/lib/api";
import { TaskList } from "@/components/TaskList";
import { TaskForm } from "@/components/TaskForm";
import { TaskFilters } from "@/components/TaskFilters";
import { NavBar } from "@/components/NavBar";

type Task = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "in_review" | "done" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string | null;
  assignments?: { assignee: { id: string; name: string } }[];
};

type Member = { userId: string; user: { id: string; name: string } };

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [filters, setFilters] = useState<TaskFiltersType>({ sortBy: "dueDate" });
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    (currentFilters: TaskFiltersType) => {
      getTasks(currentFilters)
        .then((data) => setTasks(data.tasks))
        .catch((err) => {
          if (err instanceof ApiError && err.status === 401) {
            clearToken();
            router.push("/login");
            return;
          }
          setError(err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในระบบ");
        });
    },
    [router]
  );

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    getTeamMembers()
      .then((data) => setMembers(data.members))
      .catch(() => {});
    load(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFiltersChange(next: TaskFiltersType) {
    setFilters(next);
    load(next);
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <NavBar active="tasks" />
      <main className="mx-auto max-w-5xl px-6 py-10">
        {error && <p className="text-red-600">{error}</p>}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              รายการงานทั้งหมด
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              จัดการงานของทีมและติดตามความคืบหน้า
            </p>
          </div>
          <Link
            href="/tasks/board"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            ดูแบบ Kanban →
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-[2fr_1fr]">
          <div>
            <TaskFilters filters={filters} onChange={handleFiltersChange} members={members} />
            {!error && !tasks && <p className="text-zinc-500">กำลังโหลด...</p>}
            {tasks && <TaskList tasks={tasks} />}
          </div>
          <TaskForm members={members} onCreated={() => load(filters)} />
        </div>
      </main>
    </div>
  );
}
