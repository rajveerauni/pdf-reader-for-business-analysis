import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = workerSrc;

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_PAGES = 60;

export async function extractTextFromPdf(file: File): Promise<string> {
  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are supported.");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("PDF is too large. Please upload a file smaller than 10MB.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  if (pdf.numPages > MAX_PAGES) {
    throw new Error(`PDF has too many pages (${pdf.numPages}). Max is ${MAX_PAGES}.`);
  }

  const pages: string[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (pageText) {
      pages.push(pageText);
    }
  }

  const text = pages.join("\n");
  if (text.length < 100) {
    throw new Error("Could not extract enough readable text from this PDF.");
  }

  return text;
}
