import { Router } from "express";

import { getQaFromGroq } from "../lib/groq.js";
import { normalizeQa } from "../lib/normalizeQa.js";
import { qaInputSchema } from "../types/insights.js";

export const qaRouter = Router();

qaRouter.post("/", async (req, res) => {
  const validation = qaInputSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: validation.error.issues[0]?.message ?? "Invalid input.",
    });
  }

  try {
    const llmContent = await getQaFromGroq(validation.data);
    const modelJson = JSON.parse(llmContent);
    const qa = normalizeQa(modelJson);
    return res.json({ qa });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected Q&A failure.";
    return res.status(502).json({
      error: `Unable to answer question: ${message}`,
    });
  }
});

