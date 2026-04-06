import { useState } from "react";

import { InsightsDashboard } from "./components/InsightsDashboard";
import { PdfUploader } from "./components/PdfUploader";
import { analyzeDocument } from "./lib/api";
import { extractTextFromPdf } from "./lib/pdf";
import type { Insights } from "./types/insights";

function App() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setSelectedFileName(file.name);
    setIsLoading(true);

    try {
      const text = await extractTextFromPdf(file);
      const result = await analyzeDocument(text, file.name);
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
    <main className="min-h-screen px-4 py-8 text-slate-100 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wider text-blue-300">
            Business Insight Extractor
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            Groq-Powered PDF Analysis Dashboard
          </h1>
          <p className="max-w-3xl text-slate-300">
            Upload a business PDF and get detailed, actionable insights including where changes
            happened, what performed best, what needs improvement, and balanced pros/cons.
          </p>
        </header>

        <PdfUploader onSelect={handleFileSelect} disabled={isLoading} />

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-300">
          <span className="font-semibold text-slate-100">File:</span>{" "}
          {selectedFileName ?? "No file selected"}
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <InsightsDashboard insights={insights} isLoading={isLoading} />
      </div>
    </main>
  );
}

export default App;
