import { createServerSupabaseClient } from "@/lib/supabase/server";
import TemplateGalleryPage, {
  type TemplateSetSummary,
} from "./TemplateGalleryPage";
import { thumbnailSrcFromFrameLayers } from "./templateThumbnail";

type TemplateSetRow = {
  id: string;
  title: string;
  created_at: string;
  canvas_width: number;
  canvas_height: number;
  template_frames: { frame_index: number; layers: unknown }[] | null;
};

function rowsToSummaries(data: TemplateSetRow[]): TemplateSetSummary[] {
  return data.map((row) => {
    const frames = [...(row.template_frames ?? [])].sort(
      (a, b) => a.frame_index - b.frame_index
    );
    const first = frames[0];
    const thumbnailSrc = first
      ? thumbnailSrcFromFrameLayers(first.layers)
      : null;

    return {
      id: row.id,
      title: row.title,
      created_at: row.created_at,
      canvas_width: row.canvas_width,
      canvas_height: row.canvas_height,
      thumbnailSrc,
    };
  });
}

export default async function TemplatesPage() {
  const supabase = await createServerSupabaseClient();
  let templates: TemplateSetSummary[] = [];
  let isSignedIn = false;

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isSignedIn = Boolean(user);

    if (user) {
      const { data, error } = await supabase
        .from("template_sets")
        .select(
          `
          id,
          title,
          created_at,
          canvas_width,
          canvas_height,
          template_frames (
            frame_index,
            layers
          )
        `
        )
        .order("created_at", { ascending: false });

      if (!error && data) {
        templates = rowsToSummaries(data as TemplateSetRow[]);
      }
    }
  }

  return (
    <TemplateGalleryPage templates={templates} isSignedIn={isSignedIn} />
  );
}
