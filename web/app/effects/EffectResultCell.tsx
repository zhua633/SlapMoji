"use client";

import Image from "next/image";
import type { EffectDefinition } from "./effectsConfig";

export type EffectResultState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; url: string }
  | { status: "error"; message: string };

type EffectResultCellProps = {
  effect: EffectDefinition;
  result: EffectResultState;
};

export default function EffectResultCell({
  effect,
  result,
}: EffectResultCellProps) {
  return (
    <article className="flex flex-col rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      <header className="px-3 py-2 border-b border-white/10">
        <h2 className="text-sm font-medium text-white/90 capitalize">
          {effect.label}
        </h2>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-3 min-h-[180px]">
        {result.status === "idle" && (
          <p className="text-white/40 text-xs text-center px-2">
            Upload an image to generate
          </p>
        )}

        {result.status === "loading" && (
          <p className="text-white/60 text-xs animate-pulse">Generating…</p>
        )}

        {result.status === "error" && (
          <p className="text-red-400 text-xs text-center px-2">
            {result.message}
          </p>
        )}

        {result.status === "success" && (
          <a
            href={result.url}
            download={effect.filename}
            title={`Download ${effect.filename}`}
            className="group flex flex-col items-center gap-2 w-full cursor-pointer"
          >
            <Image
              src={result.url}
              alt={`${effect.label} effect result`}
              width={240}
              height={240}
              className="w-full max-h-40 object-contain rounded transition-opacity group-hover:opacity-80"
              unoptimized
            />
            <span className="text-xs font-medium text-blue-400 group-hover:text-blue-300 transition-colors">
              Click to download
            </span>
          </a>
        )}
      </div>
    </article>
  );
}
