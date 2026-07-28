"use client";

import { useState } from "react";
import { createTask, ApiError } from "@/lib/api";

type Member = { userId: string; user: { id: string; name: string } };

export function TaskForm({
  onCreated,
  members = [],
}: {
  onCreated: () => void;
  members?: Member[];
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("ต้องระบุชื่องาน");
      return;
    }
    if (dueDate && new Date(dueDate) < new Date(new Date().toDateString())) {
      setError("วันครบกำหนดต้องเป็นวันในอนาคต");
      return;
    }

    setSubmitting(true);
    try {
      await createTask({
        title,
        description,
        priority,
        dueDate: dueDate || undefined,
        assigneeId: assigneeId || undefined,
      });
      setTitle("");
      setDescription("");
      setDueDate("");
      setAssigneeId("");
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในระบบ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <h3 className="font-semibold text-zinc-900">สร้างงานใหม่</h3>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">ชื่องาน</label>
        <input
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="เช่น ออกแบบหน้า Dashboard"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">
          รายละเอียด (ไม่บังคับ)
        </label>
        <textarea
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="รายละเอียดเพิ่มเติม"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-zinc-600">ความสำคัญ</label>
          <select
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="urgent">urgent</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-zinc-600">
            วันครบกำหนด
          </label>
          <input
            type="date"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">มอบหมายให้ (ไม่บังคับ)</label>
        <select
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
        >
          <option value="">ยังไม่มอบหมาย</option>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.user.name}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? "กำลังบันทึก..." : "บันทึกงาน"}
      </button>
    </form>
  );
}
