export function buildInsightsPrompt(documentText: string): string {
  return `
You are a business analyst assistant.
Read the business document text and return ONLY valid JSON with this exact shape:
{
  "summary": "string",
  "revenue": ["string"],
  "growth": ["string"],
  "risks": ["string"],
  "opportunities": ["string"],
  "changes": [
    {
      "area": "string",
      "whatChanged": "string",
      "impact": "string"
    }
  ],
  "strengths": ["string"],
  "improvements": ["string"],
  "pros": ["string"],
  "cons": ["string"],
  "actionPlan": ["string"],
  "confidence": 0.0
}

Rules:
- Provide concise and actionable bullet-like statements.
- If a category has no evidence, return an empty array for that category.
- In "changes", capture where change happened, what changed, and likely impact.
- "strengths" should describe what the business did best.
- "improvements" should describe what needs to change next.
- "pros" and "cons" should be balanced and evidence-based.
- "actionPlan" should be prioritized, concrete next steps.
- confidence must be a number between 0 and 1.
- Do not include markdown, explanations, or code fences.

Document text:
${documentText}
`.trim();
}
