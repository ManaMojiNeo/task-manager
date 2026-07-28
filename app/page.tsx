import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Task Manager</h1>
      <p className="text-zinc-600">
        โปรเจกต์ Full-Stack Task Manager สำหรับหนังสือ ClaudeBook
      </p>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          เข้าสู่ระบบ
        </Link>
        <Link
          href="/register"
          className="rounded border px-4 py-2 text-sm font-medium"
        >
          สมัครสมาชิก
        </Link>
      </div>
    </main>
  );
}
