import Groq from "groq-sdk";

import { buildInsightsPrompt } from "./prompt.js";

const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const API_TIMEOUT_MS = 30000;

export async function getInsightsFromGroq(text: string): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY environment variable.");
  }

  const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
    timeout: API_TIMEOUT_MS,
  });

  const response = await client.chat.completions.create({
    model: GROQ_MODEL,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: "You produce strict JSON responses for business analytics.",
      },
      {
        role: "user",
        content: buildInsightsPrompt(text),
      },
    ],
    response_format: { type: "json_object" },
  });

  return response.choices[0]?.message?.content ?? "{}";
}
