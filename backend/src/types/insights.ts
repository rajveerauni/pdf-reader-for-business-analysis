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

export const qaChunkSchema = z.object({
  id: z.string(),
  pageNumber: z.number().int().positive().optional(),
  text: z.string().min(1),
});

export const qaInputSchema = z.object({
  question: z.string().min(3).max(2000),
  chunks: z.array(qaChunkSchema).min(1).max(10),
  fileName: z.string().optional(),
});

export const qaResponseSchema = z.object({
  answer: z.string(),
  citations: z
    .array(
      z.object({
        pageNumber: z.number().int().positive().optional(),
        quote: z.string(),
        reason: z.string(),
      }),
    )
    .default([]),
  followUps: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).default(0.5),
});

export type QaResponse = z.infer<typeof qaResponseSchema>;
