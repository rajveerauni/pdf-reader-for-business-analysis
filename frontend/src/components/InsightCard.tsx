type InsightCardProps = {
  title: string;
  points: string[];
  isLoading?: boolean;
  tone?: "neutral" | "positive" | "warning" | "danger";
};

const toneMap: Record<NonNullable<InsightCardProps["tone"]>, string> = {
  neutral: "border-slate-800 bg-slate-900/80",
  positive: "border-emerald-500/30 bg-emerald-500/10",
  warning: "border-amber-500/30 bg-amber-500/10",
  danger: "border-rose-500/30 bg-rose-500/10",
};

export function InsightCard({
  title,
  points,
  isLoading = false,
  tone = "neutral",
}: InsightCardProps) {
  return (
    <section
      className={`rounded-2xl border p-5 shadow-xl shadow-black/20 transition ${toneMap[tone]}`}
    >
      <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      {isLoading ? (
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-slate-700" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-slate-700" />
          <div className="h-3 w-4/6 animate-pulse rounded bg-slate-700" />
        </div>
      ) : points.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">No clear signals found in this section.</p>
      ) : (
        <ul className="mt-4 space-y-2 text-sm text-slate-200">
          {points.map((point) => (
            <li key={point} className="rounded-md bg-slate-800/70 px-3 py-2">
              {point}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
