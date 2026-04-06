import { z } from "zod";

import type { AnalyzeResponse } from "../types/insights";

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
