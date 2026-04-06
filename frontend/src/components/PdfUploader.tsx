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
      className={`rounded-2xl border border-dashed p-8 transition ${
        isDragActive
          ? "border-blue-400 bg-blue-500/10"
          : "border-slate-700 bg-slate-900/60 hover:border-slate-500"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <input {...getInputProps()} />
      <p className="text-lg font-medium text-slate-100">
        Drag and drop a PDF, or click to upload
      </p>
      <p className="mt-2 text-sm text-slate-400">
        Max 10MB, up to 60 pages. Financial statements and investor decks work best.
      </p>
    </div>
  );
}
