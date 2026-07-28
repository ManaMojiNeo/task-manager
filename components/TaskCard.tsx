import Link from "next/link";
import { StatusBadge } from "./StatusBadge";

type Task = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "in_review" | "done" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string | null;
};

export function TaskCard({ task }: { task: Task }) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      className="group block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium text-zinc-900 group-hover:text-indigo-600">
          {task.title}
        </h3>
        <StatusBadge status={task.status} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 font-medium capitalize">
          {task.priority}
        </span>
        {task.dueDate && (
          <span>
            ครบกำหนด {new Date(task.dueDate).toLocaleDateString("th-TH")}
          </span>
        )}
      </div>
    </Link>
  );
}
