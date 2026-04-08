import { qaResponseSchema } from "../types/insights.js";

export function normalizeQa(raw: unknown) {
  const parsed = qaResponseSchema.safeParse(raw);
  if (parsed.success) {
    return parsed.data;
  }

  return qaResponseSchema.parse({
    answer:
      "I couldn’t reliably parse the model output. Please re-ask the question with more context, or try a different wording.",
    confidence: 0.25,
    citations: [],
    followUps: [],
  });
}

