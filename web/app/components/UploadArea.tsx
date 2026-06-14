"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";

const EXTENSION_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
};

function normalizeMime(mime: string): string {
  if (mime === "image/pjpeg" || mime === "image/jpg") return "image/jpeg";
  return mime;
}

/** Resolve MIME type from file.type or extension; returns null if not allowed. */
export function resolveImageMimeType(
  file: File,
  allowedTypes: string[]
): string | null {
  const allowed = new Set(allowedTypes.map(normalizeMime));
  if (allowedTypes.includes("image/jpg")) allowed.add("image/jpeg");
  if (allowedTypes.includes("image/jpeg")) allowed.add("image/jpeg");

  if (file.type) {
    const mime = normalizeMime(file.type);
    if (allowed.has(mime)) return mime;
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext) {
    const fromExt = EXTENSION_MIME[ext];
    if (fromExt && allowed.has(fromExt)) return fromExt;
  }

  return null;
}

function acceptAttribute(fileTypes: string[]): string {
  const parts = new Set<string>(fileTypes);
  for (const t of fileTypes) {
    const ext = t.replace("image/", ".");
    if (ext.startsWith(".")) parts.add(ext);
  }
  return [...parts].join(",");
}

interface UploadAreaProps {
  onFileSelected?: (file: File | null) => void;
  value?: File | null;
  showConfirm?: boolean;
  onConfirm?: () => void;
  hidePreview?: boolean;
  buttonLabel?: string;
  confirmLabel?: string;
  fileTypes?: string[];
  height?: string;
  maxFileSize?: number;
}

const UploadArea: React.FC<UploadAreaProps> = ({
  onFileSelected,
  value,
  showConfirm = false,
  onConfirm,
  hidePreview = false,
  buttonLabel = "Choose file",
  confirmLabel = "Continue",
  fileTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/bmp",
  ],
  height = "auto",
  maxFileSize,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [internalFile, setInternalFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const file = value !== undefined ? value : internalFile;

  useEffect(() => {
    if (file && typeof window !== "undefined") {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isValidImage = (file: File) => {
    return resolveImageMimeType(file, fileTypes) !== null;
  };

  const isValidFileSize = (file: File) => {
    if (!maxFileSize) return true;
    return file.size <= maxFileSize;
  };

  const handleFile = (file: File) => {
    if (!isValidImage(file)) {
      if (onFileSelected) onFileSelected(null);
      if (value === undefined) setInternalFile(null);
      setPreviewUrl(null);
      const allowedTypes =
        fileTypes.length === 1
          ? fileTypes[0].replace("image/", "").toUpperCase()
          : fileTypes
              .map((t) => t.replace("image/", "").toUpperCase())
              .join(", ");
      setError(`Only ${allowedTypes} files are allowed.`);
      return;
    }

    if (!isValidFileSize(file)) {
      if (onFileSelected) onFileSelected(null);
      if (value === undefined) setInternalFile(null);
      setPreviewUrl(null);
      setError(
        `File size must be ${formatFileSize(
          maxFileSize!
        )} or less. Current size: ${formatFileSize(file.size)}`
      );
      return;
    }

    if (onFileSelected) onFileSelected(file);
    if (value === undefined) setInternalFile(file);
    setError(null);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const hasFile = file && !error;

  return (
    <div
      className={`group w-full flex flex-col items-center rounded-2xl border transition-all duration-300 px-6 py-10 sm:px-10 sm:py-12 ${
        dragActive
          ? "border-white/30 bg-white/[0.04]"
          : hasFile
            ? "border-white/15 bg-white/[0.02]"
            : "border-white/10 bg-transparent hover:border-white/20 hover:bg-white/[0.02]"
      }`}
      style={height !== "auto" ? { minHeight: height } : undefined}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptAttribute(fileTypes)}
        className="hidden"
        onChange={handleChange}
      />

      {!hasFile && (
        <>
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
            <svg
              className="h-5 w-5 text-white/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>
          <button
            type="button"
            onClick={handleButtonClick}
            className="mb-3 rounded-full bg-white px-6 py-2.5 text-[13px] font-medium text-black hover:bg-white/90 transition-colors"
          >
            {buttonLabel}
          </button>
          <span className="text-[13px] text-white/35">
            or drag and drop here
          </span>
        </>
      )}

      {error && (
        <span className="mt-2 text-[13px] text-red-400/90 text-center">
          {error}
        </span>
      )}

      {hasFile && !hidePreview && previewUrl && (
        <div className="flex flex-col items-center w-full">
          <div className="relative w-full max-h-48 mb-5 flex items-center justify-center">
            <Image
              src={previewUrl}
              alt="Preview"
              width={480}
              height={192}
              className="max-h-48 max-w-full rounded-lg object-contain"
              unoptimized
            />
          </div>
          <p className="text-[13px] text-white/50 text-center truncate max-w-full mb-1">
            {file.name}
          </p>
          <button
            type="button"
            onClick={handleButtonClick}
            className="text-[12px] text-white/35 hover:text-white/60 transition-colors underline underline-offset-2"
          >
            Choose a different file
          </button>
        </div>
      )}

      {showConfirm && hasFile && (
        <button
          type="button"
          onClick={onConfirm}
          className="mt-6 w-full sm:w-auto rounded-full bg-white px-8 py-2.5 text-[13px] font-medium text-black hover:bg-white/90 transition-colors"
        >
          {confirmLabel}
        </button>
      )}
    </div>
  );
};

export default UploadArea;
