"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getDashboard, getToken, clearToken, ApiError } from "@/lib/api";
import { SummaryCards } from "@/components/SummaryCards";
import { TaskList } from "@/components/TaskList";
import { NavBar } from "@/components/NavBar";

type Dashboard = {
  teamId: string;
  total: number;
  statusCounts: {
    todo: number;
    in_progress: number;
    in_review: number;
    done: number;
    archived: number;
  };
  upcoming: {
    id: string;
    title: string;
    status: "todo" | "in_progress" | "in_review" | "done" | "archived";
    priority: "low" | "medium" | "high" | "urgent";
    dueDate: string | null;
  }[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    getDashboard()
      .then(setData)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          router.push("/login");
          return;
        }
        setError(err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในระบบ");
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <NavBar active="dashboard" />
      <main className="mx-auto max-w-5xl px-6 py-10">
        {error && <p className="text-red-600">{error}</p>}
        {!error && !data && <p className="text-zinc-500">กำลังโหลด...</p>}
        {data && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              ภาพรวมงาน
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              สรุปสถานะงานทั้งหมดของทีมคุณ
            </p>
            <div className="mt-8">
              <SummaryCards total={data.total} statusCounts={data.statusCounts} />
            </div>
            <div className="mt-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">
                  งานที่ใกล้ครบกำหนด
                </h2>
                <Link href="/tasks" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  ดูทั้งหมด →
                </Link>
              </div>
              <div className="mt-4">
                <TaskList tasks={data.upcoming} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
