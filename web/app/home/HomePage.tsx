"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteHeader from "../components/SiteHeader";
import UploadArea, { resolveImageMimeType } from "../components/UploadArea";

const UPLOAD_FILE_TYPES = [
  "image/gif",
  "image/png",
  "image/jpeg",
  "image/jpg",
] as const;

const STEPS = [
  {
    number: "01",
    title: "Upload",
    description: "Drop a GIF, PNG, or JPG to start.",
  },
  {
    number: "02",
    title: "Edit",
    description: "Add text and images on every frame.",
  },
  {
    number: "03",
    title: "Export",
    description: "Download as GIF or PNG.",
  },
] as const;

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  const handleConfirm = () => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      const fileName = encodeURIComponent(selectedFile.name);
      const mime =
        resolveImageMimeType(selectedFile, [...UPLOAD_FILE_TYPES]) ??
        selectedFile.type;
      const fileType = encodeURIComponent(mime);
      router.push(
        `/edit?img=${encodeURIComponent(url)}&name=${fileName}&type=${fileType}`
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white">
      <SiteHeader variant="home" />

      <main className="flex-1 flex flex-col items-center px-6 pb-16 pt-12 sm:pt-16">
        <div className="w-full max-w-xl text-center mb-10 sm:mb-14">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-4">
            Meme &amp; GIF editor
          </p>
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-white mb-4">
            Start with an image
          </h1>
          <p className="text-[15px] leading-relaxed text-white/50 max-w-md mx-auto">
            Upload a GIF, PNG, or JPG, layer text and stickers, then export. Sign in
            to save projects to your gallery.
          </p>
        </div>

        <ol className="w-full max-w-xl grid grid-cols-3 gap-3 sm:gap-6 mb-10 sm:mb-12">
          {STEPS.map((step) => (
            <li key={step.number} className="text-center">
              <span className="block text-[10px] sm:text-[11px] font-mono tracking-widest text-white/30 mb-2">
                {step.number}
              </span>
              <span className="block text-[13px] sm:text-sm font-medium text-white/90 mb-1">
                {step.title}
              </span>
              <span className="block text-[11px] sm:text-xs leading-snug text-white/40">
                {step.description}
              </span>
            </li>
          ))}
        </ol>

        <div className="w-full max-w-xl">
          <UploadArea
            onFileSelected={setSelectedFile}
            value={selectedFile}
            showConfirm={true}
            onConfirm={handleConfirm}
            confirmLabel="Open editor"
            buttonLabel="Choose file"
            height="auto"
            fileTypes={[...UPLOAD_FILE_TYPES]}
            maxFileSize={10 * 1024 * 1024}
          />
          <p className="mt-4 text-center text-[11px] text-white/30">
            GIF, PNG, or JPG · up to 10 MB
          </p>
        </div>

        <Link
          href="/templates"
          className="mt-10 text-[13px] text-white/40 hover:text-white/70 transition-colors"
        >
          View saved projects →
        </Link>
      </main>
    </div>
  );
}
