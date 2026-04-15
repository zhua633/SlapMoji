"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UploadArea from "../components/UploadArea";

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  const handleConfirm = () => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      const fileName = encodeURIComponent(selectedFile.name);
      const fileType = encodeURIComponent(selectedFile.type);
      router.push(
        `/edit?img=${encodeURIComponent(url)}&name=${fileName}&type=${fileType}`
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white p-4">
      <header className="shrink-0 mb-4">
        <Link
          href="/templates"
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          Templates
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center min-h-0">
        <UploadArea
          onFileSelected={setSelectedFile}
          value={selectedFile}
          showConfirm={true}
          onConfirm={handleConfirm}
          height="min(500px, 80vh)"
          fileTypes={["image/gif", "image/png"]}
          maxFileSize={10 * 1024 * 1024} // 10MB limit for GIF files
        />
      </div>
    </div>
  );
}
