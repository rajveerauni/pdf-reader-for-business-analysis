import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

type PdfUploaderProps = {
  onSelect: (file: File) => void;
  disabled?: boolean;
};

export function PdfUploader({ onSelect, disabled = false }: PdfUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) {
        onSelect(acceptedFiles[0]);
      }
    },
    [onSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`rounded-3xl border border-dashed p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl transition ${
        isDragActive
          ? "border-blue-300 bg-blue-500/10"
          : "border-white/10 bg-white/5 hover:border-white/20"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <input {...getInputProps()} />
      <p className="text-sm font-semibold text-slate-100">Upload PDF</p>
      <p className="mt-2 text-sm text-slate-300">
        Drag & drop or click. We’ll extract text and generate insights.
      </p>
      <p className="mt-2 text-xs text-slate-500">Max 10MB • Up to 60 pages</p>
    </div>
  );
}
