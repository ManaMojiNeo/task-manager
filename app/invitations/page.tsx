"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getMyInvitations, acceptInvitation, getToken, clearToken, ApiError } from "@/lib/api";
import { NavBar } from "@/components/NavBar";

type Invitation = {
  id: string;
  token: string;
  role: string;
  expiresAt: string;
  team: { id: string; name: string };
  inviter: { name: string };
};

export default function InvitationsPage() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    getMyInvitations()
      .then((data) => setInvitations(data.invitations))
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

  async function handleAccept(inv: Invitation) {
    setAcceptingId(inv.id);
    setSuccessMsg(null);
    try {
      await acceptInvitation(inv.token);
      setSuccessMsg(`เข้าร่วมทีม "${inv.team.name}" สำเร็จแล้ว`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในระบบ");
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <NavBar active="invitations" />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">คำเชิญเข้าร่วมทีม</h1>
        <p className="mt-1 text-sm text-zinc-500">คำเชิญที่ส่งมายังอีเมลของคุณและยังไม่ได้ตอบรับ</p>

        {error && <p className="mt-4 text-red-600">{error}</p>}
        {successMsg && <p className="mt-4 text-sm text-emerald-600">{successMsg}</p>}
        {!invitations && !error && <p className="mt-4 text-sm text-zinc-500">กำลังโหลด...</p>}

        <div className="mt-6 flex flex-col gap-3">
          {invitations?.length === 0 && (
            <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
              ไม่มีคำเชิญที่รอตอบรับในขณะนี้
            </p>
          )}
          {invitations?.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="font-medium text-zinc-900">ทีม {inv.team.name}</p>
                <p className="text-xs text-zinc-500">เชิญโดย {inv.inviter.name}</p>
              </div>
              <button
                onClick={() => handleAccept(inv)}
                disabled={acceptingId === inv.id}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {acceptingId === inv.id ? "กำลังเข้าร่วม..." : "ตอบรับ"}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
