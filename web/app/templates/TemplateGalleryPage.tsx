import Link from "next/link";

export default function TemplateGalleryPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="mb-8">
        <Link
          href="/"
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          ← Home
        </Link>
      </header>
      <main className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Templates
        </h1>
        <p className="text-white/60 text-sm mb-8">
          Browse starter layouts for your slapmoji. This list is a placeholder
          for now.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {["Template A", "Template B", "Template C", "Template D"].map(
            (name) => (
              <li
                key={name}
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-6 text-center text-white/80 text-sm"
              >
                {name}
              </li>
            )
          )}
        </ul>
      </main>
    </div>
  );
}
