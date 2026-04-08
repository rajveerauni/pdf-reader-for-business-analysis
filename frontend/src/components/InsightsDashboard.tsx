import type { Insights } from "../types/insights";
import { ChangesTable } from "./ChangesTable";
import { InsightCard } from "./InsightCard";

type InsightsDashboardProps = {
  insights: Insights | null;
  isLoading: boolean;
  theme?: "dark" | "light";
};

export function InsightsDashboard({
  insights,
  isLoading,
  theme = "dark",
}: InsightsDashboardProps) {
  const confidence = insights ? Math.round(insights.confidence * 100) : null;
  const isLight = theme === "light";

  return (
    <div className="space-y-5">
      <section
        className={`rounded-2xl border p-5 ${
          isLight
            ? "border-slate-300 bg-gradient-to-r from-white via-slate-50 to-blue-50"
            : "border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-blue-900/30"
        }`}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p
              className={`text-xs uppercase tracking-widest ${
                isLight ? "text-blue-700" : "text-blue-300"
              }`}
            >
              Executive Summary
            </p>
            {isLoading ? (
              <div
                className={`mt-3 h-4 w-3/4 animate-pulse rounded ${
                  isLight ? "bg-slate-300" : "bg-slate-700"
                }`}
              />
            ) : (
              <p className={`mt-3 max-w-4xl ${isLight ? "text-slate-700" : "text-slate-200"}`}>
                {insights?.summary ?? "Upload and analyze a business document to generate insights."}
              </p>
            )}
          </div>
          <div
            className={`rounded-xl border px-3 py-2 text-xs ${
              isLight
                ? "border-slate-300 bg-white/90 text-slate-700"
                : "border-slate-700 bg-slate-950/50 text-slate-300"
            }`}
          >
            <p className={`uppercase tracking-widest ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Confidence
            </p>
            <p className={`mt-1 text-lg font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
              {confidence !== null ? `${confidence}%` : "N/A"}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <InsightCard
          title="Revenue Insights"
          points={insights?.revenue ?? []}
          isLoading={isLoading}
          tone="positive"
        />
        <InsightCard
          title="Growth Trends"
          points={insights?.growth ?? []}
          isLoading={isLoading}
          tone="positive"
        />
        <InsightCard
          title="Key Risks"
          points={insights?.risks ?? []}
          isLoading={isLoading}
          tone="danger"
        />
        <InsightCard
          title="Strategic Opportunities"
          points={insights?.opportunities ?? []}
          isLoading={isLoading}
          tone="warning"
        />
      </div>

      <ChangesTable changes={insights?.changes ?? []} isLoading={isLoading} />

      <div className="grid gap-4 md:grid-cols-2">
        <InsightCard
          title="What They Did Best"
          points={insights?.strengths ?? []}
          isLoading={isLoading}
          tone="positive"
        />
        <InsightCard
          title="What Needs To Change"
          points={insights?.improvements ?? []}
          isLoading={isLoading}
          tone="warning"
        />
        <InsightCard
          title="Pros"
          points={insights?.pros ?? []}
          isLoading={isLoading}
          tone="positive"
        />
        <InsightCard
          title="Cons"
          points={insights?.cons ?? []}
          isLoading={isLoading}
          tone="danger"
        />
      </div>

      <div className="grid gap-4">
        <InsightCard
          title="Recommended Action Plan"
          points={insights?.actionPlan ?? []}
          isLoading={isLoading}
          tone="neutral"
        />
      </div>
    </div>
  );
}
