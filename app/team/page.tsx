"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getTeamMembers, inviteMember, getToken, clearToken, ApiError } from "@/lib/api";
import { NavBar } from "@/components/NavBar";

type Member = {
  userId: string;
  role: "owner" | "team_lead" | "member";
  joinedAt: string;
  user: { id: string; name: string; email: string };
};

const ROLE_LABEL: Record<Member["role"], string> = {
  owner: "เจ้าของทีม",
  team_lead: "หัวหน้าทีม",
  member: "สมาชิก",
};

export default function TeamPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    getTeamMembers()
      .then((data) => setMembers(data.members))
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

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteMsg(null);
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await inviteMember(email.trim());
      setInviteMsg(`ส่งคำเชิญไปยัง ${email.trim()} แล้ว — เมื่อบัญชีนั้นเข้าสู่ระบบและเปิดหน้า "คำเชิญ" จะเห็นคำเชิญนี้ทันที`);
      setEmail("");
    } catch (err) {
      setInviteMsg(err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในระบบ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <NavBar active="team" />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">สมาชิกในทีม</h1>
        <p className="mt-1 text-sm text-zinc-500">
          จัดการสมาชิกของทีมและเชิญเพื่อนร่วมงานใหม่
        </p>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-zinc-900">เชิญสมาชิกใหม่</h2>
          <form onSubmit={handleInvite} className="mt-3 flex gap-2">
            <input
              type="email"
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "กำลังส่ง..." : "ส่งคำเชิญ"}
            </button>
          </form>
          {inviteMsg && <p className="mt-2 text-sm text-zinc-600">{inviteMsg}</p>}
        </div>

        <div className="mt-8">
          <h2 className="font-semibold text-zinc-900">สมาชิกทั้งหมด</h2>
          {!members && !error && <p className="mt-3 text-sm text-zinc-500">กำลังโหลด...</p>}
          <div className="mt-3 flex flex-col gap-3">
            {members?.map((m) => (
              <div
                key={m.userId}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600">
                    {m.user.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-medium text-zinc-900">{m.user.name}</p>
                    <p className="text-xs text-zinc-500">{m.user.email}</p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                  {ROLE_LABEL[m.role]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
