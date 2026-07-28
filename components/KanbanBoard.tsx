"use client";

import { useState } from "react";
import Link from "next/link";

type Task = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "in_review" | "done" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string | null;
  assignments?: { assignee: { id: string; name: string } }[];
};

const COLUMNS: { key: Task["status"]; label: string }[] = [
  { key: "todo", label: "รอดำเนินการ" },
  { key: "in_progress", label: "กำลังทำ" },
  { key: "in_review", label: "รอตรวจสอบ" },
  { key: "done", label: "เสร็จแล้ว" },
];

export function KanbanBoard({
  tasks,
  onStatusChange,
}: {
  tasks: Task[];
  onStatusChange: (taskId: string, status: string) => void;
}) {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  function handleDrop(e: React.DragEvent, status: string) {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) onStatusChange(taskId, status);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.key);
        return (
          <div
            key={col.key}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverColumn(col.key);
            }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={(e) => handleDrop(e, col.key)}
            className={`w-72 flex-shrink-0 rounded-xl border p-3 transition ${
              dragOverColumn === col.key
                ? "border-indigo-400 bg-indigo-50/50"
                : "border-zinc-200 bg-zinc-100/60"
            }`}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-zinc-700">{col.label}</h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-zinc-500">
                {columnTasks.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {columnTasks.map((task) => {
                const assignee = task.assignments?.[0]?.assignee;
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", task.id)}
                    className="cursor-grab rounded-lg border border-zinc-200 bg-white p-3 shadow-sm active:cursor-grabbing"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/tasks/${task.id}`}
                        className="text-sm font-medium text-zinc-900 hover:text-indigo-600"
                      >
                        {task.title}
                      </Link>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium capitalize text-zinc-600">
                        {task.priority}
                      </span>
                      {assignee && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white" title={assignee.name}>
                          {assignee.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {columnTasks.length === 0 && (
                <p className="rounded-lg border border-dashed border-zinc-300 p-4 text-center text-xs text-zinc-400">
                  ลากงานมาวางที่นี่
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
