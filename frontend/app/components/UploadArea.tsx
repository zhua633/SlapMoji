"use client";
import React, { useRef, useState } from "react";

const isValidImage = (file: File) => {
  return (
    file.type.startsWith("image/") &&
    [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/bmp",
    ].includes(file.type)
  );
};

interface UploadAreaProps {
  onFileSelected?: (file: File | null) => void;
  value?: File | null;
  showConfirm?: boolean;
  onConfirm?: () => void;
  hidePreview?: boolean;
  buttonLabel?: string;
}

const UploadArea: React.FC<UploadAreaProps> = ({
  onFileSelected,
  value,
  showConfirm = false,
  onConfirm,
  hidePreview = false,
  buttonLabel = "Upload Image",
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [internalFile, setInternalFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Use controlled or uncontrolled file state
  const file = value !== undefined ? value : internalFile;

  const handleFile = (file: File) => {
    if (isValidImage(file)) {
      if (onFileSelected) onFileSelected(file);
      if (value === undefined) setInternalFile(file);
      setError(null);
    } else {
      if (onFileSelected) onFileSelected(null);
      if (value === undefined) setInternalFile(null);
      setError("Only image files (PNG, JPG, JPEG, GIF, WEBP, SVG, BMP) are allowed.");
    }
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
      className={`w-full max-w-xl h-96 flex flex-col items-center justify-center border-4 border-dotted rounded-xl transition-colors duration-200 ${
        dragActive ? "border-blue-400 bg-black/60" : "border-gray-600 bg-black/80"
      }`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml,image/bmp"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={handleButtonClick}
        className="px-6 py-3 bg-gray-800 border border-gray-500 rounded-lg text-lg font-semibold hover:bg-gray-700 transition-colors mb-4"
      >
        {buttonLabel}
      </button>
      <span className="text-gray-400">or drag and drop a picture here</span>
      {error && <span className="text-red-400 mt-2">{error}</span>}
      {file && !error && !hidePreview && (
        <div className="mt-6 flex flex-col items-center">
          <span className="text-green-400">Selected: {file.name}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="mt-2 max-h-40 rounded shadow-lg"
          />
        </div>
      )}
      {showConfirm && file && !error && (
        <button
          type="button"
          onClick={onConfirm}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Confirm Upload
        </button>
      )}
    </div>
  );
};

export default UploadArea; 