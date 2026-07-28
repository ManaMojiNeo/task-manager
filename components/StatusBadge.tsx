type Status = "todo" | "in_progress" | "in_review" | "done" | "archived";

const STATUS_LABEL: Record<Status, string> = {
  todo: "รอดำเนินการ",
  in_progress: "กำลังทำ",
  in_review: "รอตรวจสอบ",
  done: "เสร็จแล้ว",
  archived: "เก็บเข้าคลัง",
};

const STATUS_COLOR: Record<Status, string> = {
  todo: "bg-zinc-100 text-zinc-700",
  in_progress: "bg-blue-100 text-blue-700",
  in_review: "bg-amber-100 text-amber-700",
  done: "bg-green-100 text-green-700",
  archived: "bg-zinc-200 text-zinc-500",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-block rounded px-2 py-1 text-xs font-medium ${STATUS_COLOR[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
