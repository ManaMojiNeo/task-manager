"use client";

import { useState } from "react";
import { addComment, ApiError } from "@/lib/api";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string };
};

export function CommentSection({
  taskId,
  comments,
  onAdded,
}: {
  taskId: string;
  comments: Comment[];
  onAdded: () => void;
}) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError("ต้องระบุเนื้อหาความคิดเห็น");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await addComment(taskId, content);
      setContent("");
      onAdded();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในระบบ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-zinc-900">ความคิดเห็น</h3>
      <div className="mt-3 flex flex-col gap-3">
        {comments.length === 0 && (
          <p className="text-sm text-zinc-500">ยังไม่มีความคิดเห็น</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="rounded-lg bg-zinc-50 p-3 text-sm">
            <p className="font-medium text-zinc-900">{c.user.name}</p>
            <p className="mt-0.5 text-zinc-600">{c.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="เพิ่มความคิดเห็น..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          ส่ง
        </button>
      </form>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
