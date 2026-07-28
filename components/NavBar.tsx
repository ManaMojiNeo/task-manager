"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/api";

export function NavBar({ active }: { active: "dashboard" | "tasks" }) {
  const router = useRouter();

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  return (
    <nav className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <span className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-xs text-white">
              ◆
            </span>
            Task Manager
          </span>
          <div className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                active === "dashboard"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/tasks"
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                active === "tasks"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Tasks
            </Link>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
        >
          ออกจากระบบ
        </button>
      </div>
    </nav>
  );
}
