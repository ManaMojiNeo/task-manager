"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getDashboard, getToken, clearToken, ApiError } from "@/lib/api";
import { SummaryCards } from "@/components/SummaryCards";
import { TaskList } from "@/components/TaskList";

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

  if (error) return <main className="p-8 text-red-600">{error}</main>;
  if (!data) return <main className="p-8 text-zinc-500">กำลังโหลด...</main>;

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <Link href="/tasks" className="text-sm underline">
          ดูงานทั้งหมด →
        </Link>
      </div>
      <SummaryCards total={data.total} statusCounts={data.statusCounts} />
      <h2 className="mb-3 mt-8 font-semibold">งานที่ใกล้ครบกำหนด</h2>
      <TaskList tasks={data.upcoming} />
    </main>
  );
}
