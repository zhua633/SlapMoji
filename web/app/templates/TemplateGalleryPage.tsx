import Image from "next/image";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";

export type TemplateSetSummary = {
  id: string;
  title: string;
  created_at: string;
  canvas_width: number;
  canvas_height: number;
  thumbnailSrc: string | null;
};

type TemplateGalleryPageProps = {
  templates: TemplateSetSummary[];
  isSignedIn: boolean;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function TemplateGalleryPage({
  templates,
  isSignedIn,
}: TemplateGalleryPageProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <SiteHeader variant="templates" />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Your templates
        </h1>
        <p className="text-white/60 text-sm mb-8">
          Projects you saved from the editor appear here.
        </p>

        {!isSignedIn && (
          <div className="rounded-lg border border-white/15 bg-white/5 px-4 py-6 text-center">
            <p className="text-white/70 text-sm mb-4">
              Sign in to see templates you&apos;ve saved.
            </p>
            <Link
              href="/login"
              className="inline-flex text-sm font-medium text-white border border-white/40 rounded-lg px-4 py-2 hover:bg-white/10 transition-colors"
            >
              Sign in
            </Link>
          </div>
        )}

        {isSignedIn && templates.length === 0 && (
          <p className="text-white/50 text-sm">
            No templates yet. Open an image in the editor and use{" "}
            <span className="text-white/70">Save template</span> while signed
            in.
          </p>
        )}

        {isSignedIn && templates.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2">
            {templates.map((t) => (
              <li
                key={t.id}
                className="rounded-lg border border-white/15 bg-white/5 overflow-hidden flex flex-col"
              >
                <div className="relative w-full aspect-[4/3] bg-zinc-900">
                  {t.thumbnailSrc ? (
                    <Image
                      src={t.thumbnailSrc}
                      alt=""
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 100vw, 50vw"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/35 text-sm">
                      No preview
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col gap-1">
                  <p className="font-medium text-white line-clamp-2">
                    {t.title}
                  </p>
                  <p className="text-white/50 text-xs">
                    {t.canvas_width}×{t.canvas_height}px ·{" "}
                    {formatDate(t.created_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
