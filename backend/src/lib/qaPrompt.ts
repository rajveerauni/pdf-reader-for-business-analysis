type Chunk = {
  id: string;
  pageNumber?: number;
  text: string;
};

export function buildQaPrompt(params: {
  question: string;
  fileName?: string;
  chunks: Chunk[];
}): string {
  const chunkBlock = params.chunks
    .map((c) => {
      const page = c.pageNumber ? `page ${c.pageNumber}` : "page ?";
      return `[${c.id} | ${page}]\n${c.text}`;
    })
    .join("\n\n---\n\n");

  return `
You are an expert business analyst assistant.
Answer the user's question using ONLY the provided document excerpts.

Return ONLY valid JSON with this exact shape:
{
  "answer": "string",
  "citations": [
    { "pageNumber": 1, "quote": "string", "reason": "string" }
  ],
  "followUps": ["string"],
  "confidence": 0.0
}

Rules:
- If the excerpts do not contain enough evidence, say so clearly in "answer" and lower confidence.
- Provide 2-5 citations when possible. Quotes must be copied from the excerpts verbatim.
- Keep "answer" concise and actionable.
- "followUps" should be 2-4 short suggested next questions.
- Do not include markdown, explanations, or code fences.

File name (optional): ${params.fileName ?? "N/A"}

User question:
${params.question}

Document excerpts:
${chunkBlock}
`.trim();
}

