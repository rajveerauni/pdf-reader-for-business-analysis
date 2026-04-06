import { z } from "zod";

export const insightsSchema = z.object({
  summary: z.string().default("No summary available."),
  revenue: z.array(z.string()).default([]),
  growth: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  opportunities: z.array(z.string()).default([]),
  changes: z
    .array(
      z.object({
        area: z.string(),
        whatChanged: z.string(),
        impact: z.string(),
      }),
    )
    .default([]),
  strengths: z.array(z.string()).default([]),
  improvements: z.array(z.string()).default([]),
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
  actionPlan: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).default(0.5),
});

export type Insights = z.infer<typeof insightsSchema>;

export const analyzeInputSchema = z.object({
  text: z.string().min(100, "Document text is too short to analyze.").max(250000),
  fileName: z.string().optional(),
});
