export type QaChunk = {
  id: string;
  pageNumber?: number;
  text: string;
};

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/g)
    .filter((t) => t.length >= 3);
}

function scoreChunk(queryTokens: Set<string>, chunkText: string): number {
  const tokens = tokenize(chunkText);
  let score = 0;
  for (const t of tokens) {
    if (queryTokens.has(t)) score += 1;
  }
  return score;
}

export function selectRelevantChunks(params: {
  question: string;
  pages: Array<{ pageNumber: number; text: string }>;
  maxChunks?: number;
  maxCharsPerChunk?: number;
}): QaChunk[] {
  const maxChunks = params.maxChunks ?? 6;
  const maxChars = params.maxCharsPerChunk ?? 1800;

  const queryTokens = new Set(tokenize(params.question));
  const scored = params.pages
    .map((p) => {
      const clipped = p.text.length > maxChars ? `${p.text.slice(0, maxChars)}…` : p.text;
      return {
        id: `p${p.pageNumber}`,
        pageNumber: p.pageNumber,
        text: clipped,
        score: scoreChunk(queryTokens, clipped),
      };
    })
    .sort((a, b) => b.score - a.score);

  const top = scored.slice(0, maxChunks);

  // If all scores are zero, fall back to first few pages for baseline context.
  if (top.length > 0 && top[0]!.score === 0) {
    return params.pages.slice(0, maxChunks).map((p) => ({
      id: `p${p.pageNumber}`,
      pageNumber: p.pageNumber,
      text: p.text.length > maxChars ? `${p.text.slice(0, maxChars)}…` : p.text,
    }));
  }

  return top.map(({ id, pageNumber, text }) => ({ id, pageNumber, text }));
}

