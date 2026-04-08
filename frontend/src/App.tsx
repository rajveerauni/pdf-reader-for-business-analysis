import { useState } from "react";

import { InsightsDashboard } from "./components/InsightsDashboard";
import { PdfUploader } from "./components/PdfUploader";
import { PdfQaPanel } from "./components/PdfQaPanel";
import { analyzeDocument } from "./lib/api";
import { extractTextFromPdf } from "./lib/pdf";
import type { Insights } from "./types/insights";

function App() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [pdfPages, setPdfPages] = useState<Array<{ pageNumber: number; text: string }> | null>(
    null,
  );
  const [pdfFullText, setPdfFullText] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setSelectedFileName(file.name);
    setIsLoading(true);

    try {
      const extracted = await extractTextFromPdf(file);
      setPdfPages(extracted.pages);
      setPdfFullText(extracted.fullText);

      const result = await analyzeDocument(extracted.fullText, file.name);
      setInsights(result.insights);
    } catch (analysisError) {
      const message =
        analysisError instanceof Error
          ? analysisError.message
          : "Unexpected error during analysis.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen text-slate-100">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-12 lg:gap-8 lg:px-8">
        <aside className="lg:col-span-3">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                PDF Intelligence
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100">
                Insight Dashboard
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Apple-clean visuals, Fluent structure, and fast Groq-powered analysis.
              </p>
            </div>

            <PdfUploader onSelect={handleFileSelect} disabled={isLoading} />

            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 px-4 py-3 text-sm text-slate-300">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-widest text-slate-400">Document</span>
                <span className="text-xs text-slate-400">
                  {pdfPages ? `${pdfPages.length} pages` : "—"}
                </span>
              </div>
              <p className="mt-2 font-medium text-slate-100">
                {selectedFileName ?? "No file selected"}
              </p>
              {pdfFullText ? (
                <p className="mt-1 text-xs text-slate-500">
                  Extracted text: {pdfFullText.length.toLocaleString()} chars
                </p>
              ) : null}
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}
          </div>
        </aside>

        <section className="space-y-6 lg:col-span-9">
          <PdfQaPanel fileName={selectedFileName} pages={pdfPages} />
          <InsightsDashboard insights={insights} isLoading={isLoading} />
        </section>
      </div>
    </main>
  );
}

export default App;
