"use client";

import type { TaskFilters as TaskFiltersType } from "@/lib/api";

type Member = { userId: string; user: { id: string; name: string } };

export function TaskFilters({
  filters,
  onChange,
  members,
}: {
  filters: TaskFiltersType;
  onChange: (filters: TaskFiltersType) => void;
  members: Member[];
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
      <input
        type="text"
        placeholder="ค้นหาชื่องาน..."
        value={filters.q ?? ""}
        onChange={(e) => onChange({ ...filters, q: e.target.value })}
        className="min-w-[160px] flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <select
        value={filters.status ?? ""}
        onChange={(e) => onChange({ ...filters, status: e.target.value || undefined })}
        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value="">ทุกสถานะ</option>
        <option value="todo">รอดำเนินการ</option>
        <option value="in_progress">กำลังทำ</option>
        <option value="in_review">รอตรวจสอบ</option>
        <option value="done">เสร็จแล้ว</option>
        <option value="archived">เก็บเข้าคลัง</option>
      </select>
      <select
        value={filters.priority ?? ""}
        onChange={(e) => onChange({ ...filters, priority: e.target.value || undefined })}
        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value="">ทุกความสำคัญ</option>
        <option value="low">low</option>
        <option value="medium">medium</option>
        <option value="high">high</option>
        <option value="urgent">urgent</option>
      </select>
      <select
        value={filters.assigneeId ?? ""}
        onChange={(e) => onChange({ ...filters, assigneeId: e.target.value || undefined })}
        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value="">ทุกผู้รับผิดชอบ</option>
        {members.map((m) => (
          <option key={m.userId} value={m.userId}>
            {m.user.name}
          </option>
        ))}
      </select>
      <select
        value={filters.sortBy ?? "dueDate"}
        onChange={(e) => onChange({ ...filters, sortBy: e.target.value || undefined })}
        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value="dueDate">เรียงตามวันครบกำหนด</option>
        <option value="priority">เรียงตามความสำคัญ</option>
        <option value="createdAt">เรียงตามวันที่สร้าง</option>
        <option value="title">เรียงตามชื่องาน</option>
      </select>
    </div>
  );
}
