import type { SupabaseClient } from "@supabase/supabase-js";
import type { Frame, Layer } from "./editTypes";

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

/** Ensure layer image sources are data URLs so they persist in JSON. */
export async function layersForTemplatePayload(layers: Layer[]): Promise<Layer[]> {
  const out: Layer[] = [];
  for (const layer of layers) {
    if (layer.type !== "image" || !layer.src) {
      out.push({ ...layer });
      continue;
    }
    const src = layer.src;
    if (src.startsWith("data:")) {
      out.push({ ...layer });
      continue;
    }
    if (src.startsWith("blob:") || src.startsWith("http")) {
      try {
        const res = await fetch(src);
        const blob = await res.blob();
        const dataUrl = await blobToDataUrl(blob);
        out.push({ ...layer, src: dataUrl });
      } catch {
        out.push({ ...layer });
      }
      continue;
    }
    out.push({ ...layer });
  }
  return out;
}

function gifDelayToMs(delay: number | undefined): number | null {
  if (delay == null || delay < 0) return null;
  // gifuct-js uses GIF hundredths of a second; treat0 as minimum tick.
  return Math.max(0, delay) * 10;
}

export async function saveTemplateToSupabase(
  supabase: SupabaseClient,
  userId: string,
  options: {
    title: string;
    canvasWidth: number;
    canvasHeight: number;
    frames: Frame[];
    frameLayers: Layer[][];
  }
): Promise<{ error: Error | null }> {
  const { title, canvasWidth, canvasHeight, frames, frameLayers } = options;

  const { data: setRow, error: setError } = await supabase
    .from("template_sets")
    .insert({
      user_id: userId,
      title: title.slice(0, 200) || "Untitled template",
      canvas_width: canvasWidth,
      canvas_height: canvasHeight,
    })
    .select("id")
    .single();

  if (setError || !setRow?.id) {
    return {
      error: new Error(setError?.message ?? "Failed to create template set"),
    };
  }

  const setId = setRow.id as string;

  for (let i = 0; i < frames.length; i++) {
    const layers = frameLayers[i] ?? [];
    const prepared = await layersForTemplatePayload(layers);
    const delayMs = gifDelayToMs(frames[i]?.frame?.delay);

    const { error: frameError } = await supabase.from("template_frames").insert({
      template_set_id: setId,
      frame_index: i,
      layers: prepared,
      delay_ms: delayMs,
    });

    if (frameError) {
      await supabase.from("template_sets").delete().eq("id", setId);
      return { error: new Error(frameError.message) };
    }
  }

  return { error: null };
}
