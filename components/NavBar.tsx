"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/api";
import { NotificationBell } from "./NotificationBell";

type Active = "dashboard" | "tasks" | "board" | "team" | "invitations";

const LINKS: { key: Active; href: string; label: string }[] = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard" },
  { key: "tasks", href: "/tasks", label: "Tasks" },
  { key: "board", href: "/tasks/board", label: "Board" },
  { key: "team", href: "/team", label: "Team" },
];

export function NavBar({ active }: { active: Active }) {
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
            {LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  active === link.key
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/invitations"
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              active === "invitations"
                ? "bg-indigo-50 text-indigo-600"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            คำเชิญ
          </Link>
          <NotificationBell />
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </nav>
  );
}
