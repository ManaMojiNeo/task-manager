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
      className="block rounded-lg border p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold">{task.title}</h3>
        <StatusBadge status={task.status} />
      </div>
      <p className="mt-2 text-sm text-zinc-500">
        ความสำคัญ: {task.priority} ·{" "}
        {task.dueDate
          ? `ครบกำหนด: ${new Date(task.dueDate).toLocaleDateString("th-TH")}`
          : "ไม่ระบุวันครบกำหนด"}
      </p>
    </Link>
  );
}
