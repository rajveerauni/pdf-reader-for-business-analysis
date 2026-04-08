import Groq from "groq-sdk";

import { buildInsightsPrompt } from "./prompt.js";
import { buildQaPrompt } from "./qaPrompt.js";

const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const API_TIMEOUT_MS = 30000;

function getClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY environment variable.");
  }

  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
    timeout: API_TIMEOUT_MS,
  });
}

export async function getInsightsFromGroq(text: string): Promise<string> {
  const client = getClient();
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

export async function getQaFromGroq(params: {
  question: string;
  fileName?: string;
  chunks: Array<{ id: string; pageNumber?: number; text: string }>;
}): Promise<string> {
  const client = getClient();
  const response = await client.chat.completions.create({
    model: GROQ_MODEL,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: "You produce strict JSON with citations to provided excerpts.",
      },
      {
        role: "user",
        content: buildQaPrompt(params),
      },
    ],
    response_format: { type: "json_object" },
  });

  return response.choices[0]?.message?.content ?? "{}";
}
