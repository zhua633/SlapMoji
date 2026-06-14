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

const SAVE_STEPS = [
  {
    number: "01",
    title: "Start a project",
    description: "Upload a GIF, PNG, or JPG on the home page.",
  },
  {
    number: "02",
    title: "Edit in the editor",
    description: "Add text, images, and frames.",
  },
  {
    number: "03",
    title: "Save template",
    description: 'Click "Save template" while signed in.',
  },
] as const;

export default function TemplateGalleryPage({
  templates,
  isSignedIn,
}: TemplateGalleryPageProps) {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <SiteHeader variant="templates" />

      <main className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
        <div className="mb-12 sm:mb-14">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-4">
            Your work
          </p>
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-white mb-4">
            Gallery (Work in progress)
          </h1>
          <p className="text-[15px] leading-relaxed text-white/50 max-w-lg">
            Saved projects from the editor live here. Sign in to sync across
            sessions — this gallery is read-only for now.
          </p>
        </div>

        {!isSignedIn && (
          <section className="rounded-2xl border border-white/10 px-6 py-10 sm:px-10 sm:py-12 text-center">
            <p className="text-[11px] uppercase tracking-[0.15em] text-white/35 mb-3">
              Sign in required
            </p>
            <h2 className="text-xl font-medium text-white mb-3">
              See your saved projects
            </h2>
            <p className="text-[14px] text-white/45 mb-8 max-w-sm mx-auto leading-relaxed">
              Create a free account to save templates from the editor and
              browse them here anytime.
            </p>
            <Link
              href="/login"
              className="inline-flex rounded-full bg-white px-6 py-2.5 text-[13px] font-medium text-black hover:bg-white/90 transition-colors"
            >
              Sign in
            </Link>
            <p className="mt-6 text-[13px] text-white/30">
              No account?{" "}
              <Link
                href="/login"
                className="text-white/50 hover:text-white/70 underline underline-offset-2 transition-colors"
              >
                Create one on the login page
              </Link>
            </p>
          </section>
        )}

        {isSignedIn && templates.length === 0 && (
          <section>
            <div className="rounded-2xl border border-dashed border-white/10 px-6 py-10 sm:px-10 sm:py-12 mb-10">
              <p className="text-[11px] uppercase tracking-[0.15em] text-white/35 mb-3 text-center">
                Nothing saved yet
              </p>
              <h2 className="text-xl font-medium text-white mb-2 text-center">
                Your gallery is empty
              </h2>
              <p className="text-[14px] text-white/45 text-center mb-10 max-w-md mx-auto leading-relaxed">
                Projects appear here after you save them from the editor.
              </p>

              <ol className="grid gap-6 sm:grid-cols-3 max-w-2xl mx-auto">
                {SAVE_STEPS.map((step) => (
                  <li key={step.number} className="text-center">
                    <span className="block text-[10px] font-mono tracking-widest text-white/30 mb-2">
                      {step.number}
                    </span>
                    <span className="block text-[13px] font-medium text-white/85 mb-1">
                      {step.title}
                    </span>
                    <span className="block text-[11px] leading-snug text-white/40">
                      {step.description}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="inline-flex rounded-full bg-white px-6 py-2.5 text-[13px] font-medium text-black hover:bg-white/90 transition-colors"
              >
                Start a project
              </Link>
            </div>
          </section>
        )}

        {isSignedIn && templates.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between gap-4 mb-6">
              <p className="text-[13px] text-white/40">
                {templates.length}{" "}
                {templates.length === 1 ? "project" : "projects"}
              </p>
              <Link
                href="/"
                className="text-[13px] text-white/40 hover:text-white/70 transition-colors"
              >
                New project →
              </Link>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {templates.map((t) => (
                <li
                  key={t.id}
                  className="group rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden transition-colors hover:border-white/20 hover:bg-white/[0.04]"
                >
                  <div className="relative w-full aspect-[4/3] bg-white/[0.03]">
                    {t.thumbnailSrc ? (
                      <Image
                        src={t.thumbnailSrc}
                        alt=""
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 640px) 100vw, 50vw"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[12px] text-white/25">
                        No preview
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3.5 border-t border-white/[0.06]">
                    <p className="text-[14px] font-medium text-white/90 line-clamp-1 mb-1">
                      {t.title}
                    </p>
                    <p className="text-[11px] text-white/35">
                      {t.canvas_width}×{t.canvas_height}px ·{" "}
                      {formatDate(t.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-center text-[12px] text-white/25">
              To add more, open the editor and use Save template.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
