import { insightsSchema } from "../types/insights.js";

export function normalizeInsights(raw: unknown) {
  const parsed = insightsSchema.safeParse(raw);
  if (parsed.success) {
    return parsed.data;
  }

  return insightsSchema.parse({
    summary: "Analysis returned partial output. Review source document for details.",
    confidence: 0.35,
    revenue: [],
    growth: [],
    risks: ["Model output could not be fully parsed into expected schema."],
    opportunities: [],
    changes: [],
    strengths: [],
    improvements: [],
    pros: [],
    cons: [],
    actionPlan: [],
  });
}
