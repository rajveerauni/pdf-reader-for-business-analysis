import { Router } from "express";

import { getInsightsFromGroq } from "../lib/groq.js";
import { normalizeInsights } from "../lib/normalize.js";
import { analyzeInputSchema } from "../types/insights.js";

export const analyzeRouter = Router();

analyzeRouter.post("/", async (req, res) => {
  const validation = analyzeInputSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: validation.error.issues[0]?.message ?? "Invalid input.",
    });
  }

  try {
    const llmContent = await getInsightsFromGroq(validation.data.text);
    const modelJson = JSON.parse(llmContent);
    const insights = normalizeInsights(modelJson);
    return res.json({ insights });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected analysis failure.";
    return res.status(502).json({
      error: `Unable to analyze document: ${message}`,
    });
  }
});
