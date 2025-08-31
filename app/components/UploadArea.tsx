"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";

interface UploadAreaProps {
  onFileSelected?: (file: File | null) => void;
  value?: File | null;
  showConfirm?: boolean;
  onConfirm?: () => void;
  hidePreview?: boolean;
  buttonLabel?: string;
  fileTypes?: string[]; // Array of allowed MIME types
  height?: string; // Custom height for different contexts
  maxFileSize?: number; // Maximum file size in bytes
}

const UploadArea: React.FC<UploadAreaProps> = ({
  onFileSelected,
  value,
  showConfirm = false,
  onConfirm,
  hidePreview = false,
  buttonLabel = "Upload Image",
  fileTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/bmp",
  ],
  height = "500px",
  maxFileSize,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [internalFile, setInternalFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Use controlled or uncontrolled file state
  const file = value !== undefined ? value : internalFile;

  // Create preview URL when file changes, only on client side
  useEffect(() => {
    if (file && typeof window !== "undefined") {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Cleanup function to revoke the URL
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
    return file.type.startsWith("image/") && fileTypes.includes(file.type);
  };

  const isValidFileSize = (file: File) => {
    if (!maxFileSize) return true;
    return file.size <= maxFileSize;
  };

  const handleFile = (file: File) => {
    // Check file type first
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

    // Check file size
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

    // File is valid
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

  return (
    <div
      className={`w-full max-w-2xl flex flex-col items-center justify-center border-4 border-dotted rounded-xl transition-colors duration-200 p-4 sm:p-6 md:p-8 ${
        dragActive
          ? "border-blue-400 bg-black/60"
          : "border-gray-600 bg-black/80"
      }`}
      style={{ height }}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={fileTypes.join(",")}
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={handleButtonClick}
        className="px-6 sm:px-8 py-3 sm:py-4 bg-gray-800 border border-gray-500 rounded-lg text-lg sm:text-xl font-semibold hover:bg-gray-700 transition-colors mb-4 sm:mb-6"
      >
        {buttonLabel}
      </button>
      <span className="text-gray-400 text-center mb-4">
        or drag and drop an image here
      </span>
      {error && <span className="text-red-400 mt-2 text-center">{error}</span>}
      {file && !error && !hidePreview && previewUrl && (
        <div className="mt-4 sm:mt-6 flex flex-col items-center w-full max-w-full">
          <span className="text-green-400 text-center break-all px-2 sm:px-4 mb-3 sm:mb-4 text-sm sm:text-base max-w-full">
            Selected:{" "}
            {file.name.length > 50
              ? file.name.substring(0, 47) + "..."
              : file.name}
          </span>
          <Image
            src={previewUrl}
            alt="Preview"
            width={500}
            height={192}
            className="max-h-40 sm:max-h-48 max-w-full rounded shadow-lg object-contain"
            unoptimized
          />
        </div>
      )}
      {showConfirm && file && !error && (
        <button
          type="button"
          onClick={onConfirm}
          className="mt-4 sm:mt-6 px-6 sm:px-8 py-2 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-base sm:text-lg"
        >
          Confirm Upload
        </button>
      )}
    </div>
  );
};

export default UploadArea;
