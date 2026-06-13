"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import SiteHeader from "../components/SiteHeader";
import UploadArea from "../components/UploadArea";

export default function EffectsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const handleConfirm = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/effects/zoom", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? `Request failed (${res.status})`);
        return;
      }

      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <SiteHeader variant="effects" />
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-4 pb-8 pt-4 gap-8">
        <div className="text-center max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Effects</h1>
          <p className="text-white/60 text-sm">
            Upload an image to apply the zoom effect.
          </p>
        </div>

        <UploadArea
          onFileSelected={setSelectedFile}
          value={selectedFile}
          showConfirm={true}
          onConfirm={() => void handleConfirm()}
          height="min(500px, 80vh)"
          fileTypes={["image/gif", "image/png", "image/jpeg", "image/jpg"]}
          maxFileSize={10 * 1024 * 1024}
        />

        {loading && (
          <p className="text-white/70 text-sm animate-pulse">Applying zoom effect…</p>
        )}

        {error && (
          <p className="text-red-400 text-sm text-center max-w-md">{error}</p>
        )}

        {resultUrl && !loading && (
          <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
            <h2 className="text-lg font-medium text-white/90">Result</h2>
            <Image
              src={resultUrl}
              alt="Zoom effect result"
              width={500}
              height={500}
              className="max-w-full rounded-lg shadow-lg object-contain"
              unoptimized
            />
            <a
              href={resultUrl}
              download="zoom.gif"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
            >
              Download zoom.gif
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
