import { z } from "zod";

import type { AnalyzeResponse, QaResponse } from "../types/insights";

const insightsSchema = z.object({
  summary: z.string(),
  revenue: z.array(z.string()),
  growth: z.array(z.string()),
  risks: z.array(z.string()),
  opportunities: z.array(z.string()),
  changes: z.array(
    z.object({
      area: z.string(),
      whatChanged: z.string(),
      impact: z.string(),
    }),
  ),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  actionPlan: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

const analyzeResponseSchema = z.object({
  insights: insightsSchema,
});

const qaResponseSchema = z.object({
  qa: z.object({
    answer: z.string(),
    citations: z.array(
      z.object({
        pageNumber: z.number().int().positive().optional(),
        quote: z.string(),
        reason: z.string(),
      }),
    ),
    followUps: z.array(z.string()),
    confidence: z.number().min(0).max(1),
  }),
});

export async function analyzeDocument(
  text: string,
  fileName?: string,
): Promise<AnalyzeResponse> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, fileName }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload.error === "string"
        ? payload.error
        : "Analysis request failed.";
    throw new Error(message);
  }

  return analyzeResponseSchema.parse(payload);
}

export async function askPdfQuestion(params: {
  question: string;
  chunks: Array<{ id: string; pageNumber?: number; text: string }>;
  fileName?: string;
}): Promise<QaResponse> {
  const response = await fetch("/api/qa", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload.error === "string"
        ? payload.error
        : "Q&A request failed.";
    throw new Error(message);
  }

  return qaResponseSchema.parse(payload);
}
