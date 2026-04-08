import { useMemo, useState } from "react";

import type { QaCitation } from "../types/insights";
import { askPdfQuestion } from "../lib/api";
import { selectRelevantChunks } from "../lib/retrieval";

type PdfQaPanelProps = {
  fileName: string | null;
  pages: Array<{ pageNumber: number; text: string }> | null;
};

type Message =
  | { role: "user"; content: string }
  | {
      role: "assistant";
      content: string;
      citations: QaCitation[];
      followUps: string[];
      confidence: number;
    };

function CitationChip({ citation }: { citation: QaCitation }) {
  const page = citation.pageNumber ? `p.${citation.pageNumber}` : "p.?";
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-wide text-slate-300">{page}</p>
        <p className="text-xs text-slate-400">{citation.reason}</p>
      </div>
      <p className="mt-2 text-sm text-slate-200">“{citation.quote}”</p>
    </div>
  );
}

export function PdfQaPanel({ fileName, pages }: PdfQaPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAsk = Boolean(pages && pages.length > 0 && question.trim().length > 2);

  const placeholder = useMemo(() => {
    if (!fileName) return "Upload a PDF to enable Q&A…";
    return `Ask about “${fileName}”… (e.g., “What drove the revenue change?”)`;
  }, [fileName]);

  const sendQuestion = async (override?: string) => {
    const q = (override ?? question).trim();
    if (!pages || pages.length === 0 || q.length < 3) return;

    setError(null);
    setIsAsking(true);
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setQuestion("");

    try {
      const chunks = selectRelevantChunks({ question: q, pages });
      const response = await askPdfQuestion({ question: q, chunks, fileName: fileName ?? undefined });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.qa.answer,
          citations: response.qa.citations,
          followUps: response.qa.followUps,
          confidence: response.qa.confidence,
        },
      ]);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Q&A failed.";
      setError(message);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            Ask Questions About PDF
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Get answers with citations directly from the document excerpts.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-300">
          <p className="uppercase tracking-widest text-slate-400">Status</p>
          <p className="mt-1 font-semibold text-slate-100">{pages ? "Ready" : "Waiting for PDF"}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="max-h-[360px] space-y-3 overflow-auto pr-1">
            {messages.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
                <p className="text-sm text-slate-300">
                  Try asking:
                  <span className="ml-2 rounded-md bg-slate-900/60 px-2 py-1 text-xs text-slate-200">
                    “Summarize the key risks and mitigations.”
                  </span>
                </p>
              </div>
            ) : null}

            {messages.map((m, idx) => {
              if (m.role === "user") {
                return (
                  <div
                    key={idx}
                    className="ml-auto w-[92%] rounded-2xl bg-blue-500/10 p-4 text-slate-100 ring-1 ring-blue-400/20"
                  >
                    <p className="text-xs uppercase tracking-widest text-blue-200">You</p>
                    <p className="mt-2 text-sm">{m.content}</p>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className="mr-auto w-[92%] rounded-2xl bg-slate-950/40 p-4 ring-1 ring-white/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-widest text-slate-300">Assistant</p>
                    <p className="text-xs text-slate-400">
                      Confidence: {Math.round(m.confidence * 100)}%
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-slate-100">{m.content}</p>
                  {m.followUps.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.followUps.slice(0, 4).map((fu) => (
                        <button
                          key={fu}
                          type="button"
                          className="rounded-full border border-slate-700 bg-slate-900/50 px-3 py-1 text-xs text-slate-200 hover:border-slate-500"
                          onClick={() => sendQuestion(fu)}
                        >
                          {fu}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}

            {isAsking ? (
              <div className="mr-auto w-[92%] rounded-2xl bg-slate-950/40 p-4 ring-1 ring-white/10">
                <div className="h-3 w-2/3 animate-pulse rounded bg-slate-700" />
                <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-slate-700" />
              </div>
            ) : null}
          </div>

          {error ? (
            <div className="mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="mt-4 flex items-center gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={!pages || isAsking}
              placeholder={placeholder}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-400 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") sendQuestion();
              }}
            />
            <button
              type="button"
              disabled={!canAsk || isAsking}
              onClick={() => sendQuestion()}
              className="rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Ask
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              Citations
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Quotes from the PDF excerpts used to justify answers.
            </p>

            <div className="mt-4 space-y-3">
              {(() => {
                const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant") as
                  | Extract<Message, { role: "assistant" }>
                  | undefined;
                const citations = lastAssistant?.citations ?? [];
                if (isAsking) {
                  return (
                    <div className="space-y-2">
                      <div className="h-4 w-full animate-pulse rounded bg-slate-700" />
                      <div className="h-4 w-11/12 animate-pulse rounded bg-slate-700" />
                      <div className="h-4 w-10/12 animate-pulse rounded bg-slate-700" />
                    </div>
                  );
                }
                if (citations.length === 0) {
                  return <p className="text-sm text-slate-400">No citations yet.</p>;
                }
                return citations.slice(0, 5).map((c, i) => <CitationChip key={i} citation={c} />);
              })()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

