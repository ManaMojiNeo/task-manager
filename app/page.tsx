export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Task Manager API</h1>
      <p className="text-zinc-600">
        โปรเจกต์ Full-Stack Task Manager สำหรับหนังสือ ClaudeBook — Backend API
        พร้อมใช้งานแล้ว ดูรายละเอียดที่ไฟล์ API.md ในโปรเจกต์
      </p>
      <code className="rounded bg-zinc-100 px-3 py-1 text-sm">
        POST /api/auth/register · GET /api/tasks · GET /api/dashboard
      </code>
    </main>
  );
}
