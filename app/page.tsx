import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-50 to-white px-6 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl text-white shadow-lg shadow-indigo-200">
        ◆
      </div>
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
        Task Manager
      </h1>
      <p className="mt-3 max-w-md text-zinc-500">
        โปรเจกต์ Full-Stack Task Manager สำหรับหนังสือ ClaudeBook — จัดการงานทีมของคุณให้เป็นระบบ
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/login"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
        >
          เข้าสู่ระบบ
        </Link>
        <Link
          href="/register"
          className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          สมัครสมาชิก
        </Link>
      </div>
    </main>
  );
}
