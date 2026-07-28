type StatusCounts = {
  todo: number;
  in_progress: number;
  in_review: number;
  done: number;
  archived: number;
};

const CARD_CONFIG: { key: keyof StatusCounts; label: string; accent: string }[] = [
  { key: "todo", label: "รอดำเนินการ", accent: "bg-zinc-400" },
  { key: "in_progress", label: "กำลังทำ", accent: "bg-blue-500" },
  { key: "in_review", label: "รอตรวจสอบ", accent: "bg-amber-500" },
  { key: "done", label: "เสร็จแล้ว", accent: "bg-emerald-500" },
];

export function SummaryCards({
  total,
  statusCounts,
}: {
  total: number;
  statusCounts: StatusCounts;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          งานทั้งหมด
        </p>
        <p className="mt-2 text-3xl font-semibold text-zinc-900">{total}</p>
      </div>
      {CARD_CONFIG.map((card) => (
        <div key={card.key} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${card.accent}`}></span>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              {card.label}
            </p>
          </div>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">
            {statusCounts[card.key]}
          </p>
        </div>
      ))}
    </div>
  );
}
