import { TaskCard } from "./TaskCard";
import { EmptyState } from "./EmptyState";

type Task = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "in_review" | "done" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string | null;
  assignments?: { assignee: { id: string; name: string } }[];
};

export function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon="✨"
        title="ยังไม่มีงานในทีมนี้"
        subtitle="ลองสร้างงานแรกของคุณจากฟอร์มด้านขวา"
      />
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
