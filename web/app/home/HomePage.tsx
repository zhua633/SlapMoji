"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "../components/SiteHeader";
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
    <div className="min-h-screen flex flex-col bg-black text-white">
      <SiteHeader variant="home" />
      <div className="flex-1 flex items-center justify-center min-h-0 px-4 pb-8 pt-4">
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
