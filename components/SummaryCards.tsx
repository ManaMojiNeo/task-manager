type StatusCounts = {
  todo: number;
  in_progress: number;
  in_review: number;
  done: number;
  archived: number;
};

const CARD_CONFIG: { key: keyof StatusCounts; label: string; color: string }[] = [
  { key: "todo", label: "รอดำเนินการ", color: "border-zinc-300" },
  { key: "in_progress", label: "กำลังทำ", color: "border-blue-300" },
  { key: "in_review", label: "รอตรวจสอบ", color: "border-amber-300" },
  { key: "done", label: "เสร็จแล้ว", color: "border-green-300" },
];

export function SummaryCards({
  total,
  statusCounts,
}: {
  total: number;
  statusCounts: StatusCounts;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <div className="rounded-lg border-2 border-zinc-900 p-4">
        <p className="text-sm text-zinc-500">งานทั้งหมด</p>
        <p className="text-2xl font-bold">{total}</p>
      </div>
      {CARD_CONFIG.map((card) => (
        <div key={card.key} className={`rounded-lg border-2 ${card.color} p-4`}>
          <p className="text-sm text-zinc-500">{card.label}</p>
          <p className="text-2xl font-bold">{statusCounts[card.key]}</p>
        </div>
      ))}
    </div>
  );
}
