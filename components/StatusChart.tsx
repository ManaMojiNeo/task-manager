type StatusCounts = {
  todo: number;
  in_progress: number;
  in_review: number;
  done: number;
  archived: number;
};

const SEGMENTS: { key: keyof StatusCounts; label: string; barColor: string; dotColor: string }[] = [
  { key: "todo", label: "รอดำเนินการ", barColor: "bg-zinc-400", dotColor: "bg-zinc-400" },
  { key: "in_progress", label: "กำลังทำ", barColor: "bg-blue-500", dotColor: "bg-blue-500" },
  { key: "in_review", label: "รอตรวจสอบ", barColor: "bg-amber-500", dotColor: "bg-amber-500" },
  { key: "done", label: "เสร็จแล้ว", barColor: "bg-emerald-500", dotColor: "bg-emerald-500" },
  { key: "archived", label: "เก็บเข้าคลัง", barColor: "bg-zinc-300", dotColor: "bg-zinc-300" },
];

/** แผนภูมิแท่งสัดส่วนสถานะงาน ทำด้วย CSS ล้วน ไม่ต้องพึ่งไลบรารีกราฟภายนอก */
export function StatusChart({ total, statusCounts }: { total: number; statusCounts: StatusCounts }) {
  const safeTotal = total || 1;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-zinc-900">สัดส่วนงานตามสถานะ</p>
      <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-zinc-100">
        {SEGMENTS.map((seg) => {
          const count = statusCounts[seg.key];
          if (count === 0) return null;
          const pct = (count / safeTotal) * 100;
          return (
            <div
              key={seg.key}
              className={seg.barColor}
              style={{ width: `${pct}%` }}
              title={`${seg.label}: ${count}`}
            />
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {SEGMENTS.map((seg) => (
          <div key={seg.key} className="flex items-center gap-1.5 text-xs text-zinc-600">
            <span className={`h-2 w-2 rounded-full ${seg.dotColor}`} />
            {seg.label} ({statusCounts[seg.key]})
          </div>
        ))}
      </div>
    </div>
  );
}
