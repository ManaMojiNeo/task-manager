"use client";

import { useState } from "react";
import { createTask, ApiError } from "@/lib/api";

export function TaskForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
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
      await createTask({ title, description, priority, dueDate: dueDate || undefined });
      setTitle("");
      setDescription("");
      setDueDate("");
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในระบบ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border p-4">
      <h3 className="font-semibold">สร้างงานใหม่</h3>
      <input
        className="rounded border px-3 py-2 text-sm"
        placeholder="ชื่องาน"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="rounded border px-3 py-2 text-sm"
        placeholder="รายละเอียด (ไม่บังคับ)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex gap-3">
        <select
          className="rounded border px-3 py-2 text-sm"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
          <option value="urgent">urgent</option>
        </select>
        <input
          type="date"
          className="rounded border px-3 py-2 text-sm"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? "กำลังบันทึก..." : "บันทึกงาน"}
      </button>
    </form>
  );
}
