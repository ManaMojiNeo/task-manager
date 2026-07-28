type Status = "todo" | "in_progress" | "in_review" | "done" | "archived";

const STATUS_LABEL: Record<Status, string> = {
  todo: "รอดำเนินการ",
  in_progress: "กำลังทำ",
  in_review: "รอตรวจสอบ",
  done: "เสร็จแล้ว",
  archived: "เก็บเข้าคลัง",
};

const STATUS_COLOR: Record<Status, string> = {
  todo: "bg-zinc-100 text-zinc-600",
  in_progress: "bg-blue-50 text-blue-600",
  in_review: "bg-amber-50 text-amber-600",
  done: "bg-emerald-50 text-emerald-600",
  archived: "bg-zinc-100 text-zinc-400",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLOR[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
