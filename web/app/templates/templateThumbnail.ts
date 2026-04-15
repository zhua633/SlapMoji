/** First image src in saved layers JSON (data URL or remote URL). */
export function thumbnailSrcFromFrameLayers(layers: unknown): string | null {
  if (!Array.isArray(layers)) return null;
  for (const item of layers) {
    if (!item || typeof item !== "object") continue;
    const layer = item as Record<string, unknown>;
    if (layer.type !== "image") continue;
    const src = layer.src;
    if (typeof src === "string" && src.length > 0) return src;
  }
  return null;
}
