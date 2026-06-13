"use client";

import { useCallback, useEffect, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import UploadArea from "../components/UploadArea";
import EffectResultCell, { type EffectResultState } from "./EffectResultCell";
import { EFFECTS } from "./effectsConfig";

function idleResults(): Record<string, EffectResultState> {
  return Object.fromEntries(EFFECTS.map((e) => [e.id, { status: "idle" }]));
}

async function runEffect(
  effectId: string,
  file: File
): Promise<EffectResultState> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`/api/effects/${effectId}`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      return {
        status: "error",
        message: data?.error ?? `Request failed (${res.status})`,
      };
    }

    const blob = await res.blob();
    return { status: "success", url: URL.createObjectURL(blob) };
  } catch {
    return { status: "error", message: "Network error." };
  }
}

export default function EffectsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [results, setResults] =
    useState<Record<string, EffectResultState>>(idleResults);
  const [running, setRunning] = useState(false);

  const revokeUrls = useCallback((state: Record<string, EffectResultState>) => {
    for (const result of Object.values(state)) {
      if (result.status === "success") {
        URL.revokeObjectURL(result.url);
      }
    }
  }, []);

  useEffect(() => {
    return () => revokeUrls(results);
  }, [results, revokeUrls]);

  const handleFileSelected = (file: File | null) => {
    setSelectedFile(file);
    setResults((prev) => {
      revokeUrls(prev);
      return idleResults();
    });
  };

  const handleConfirm = async () => {
    if (!selectedFile) return;

    setRunning(true);
    setResults((prev) => {
      revokeUrls(prev);
      return Object.fromEntries(
        EFFECTS.map((e) => [e.id, { status: "loading" }])
      );
    });

    const settled = await Promise.all(
      EFFECTS.map(async (effect) => {
        const result = await runEffect(effect.id, selectedFile);
        return [effect.id, result] as const;
      })
    );

    setResults(Object.fromEntries(settled));
    setRunning(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <SiteHeader variant="effects" />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-10">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight mb-2">
            Effects
          </h1>
          <p className="text-white/60 text-sm">
            Upload an image once — all effects run in parallel.
          </p>
        </div>

        <div className="flex justify-center">
          <UploadArea
            onFileSelected={handleFileSelected}
            value={selectedFile}
            showConfirm={true}
            onConfirm={() => void handleConfirm()}
            height="min(360px, 60vh)"
            fileTypes={["image/gif", "image/png", "image/jpeg", "image/jpg"]}
            maxFileSize={10 * 1024 * 1024}
          />
        </div>

        {running && (
          <p className="text-white/70 text-sm text-center animate-pulse">
            Applying effects…
          </p>
        )}

        <section
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4"
          aria-label="Effect results"
        >
          {EFFECTS.map((effect) => (
            <EffectResultCell
              key={effect.id}
              effect={effect}
              result={results[effect.id] ?? { status: "idle" }}
            />
          ))}
        </section>
      </main>
    </div>
  );
}
