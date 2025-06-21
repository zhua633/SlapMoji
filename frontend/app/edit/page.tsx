"use client";
import { Suspense } from "react";
import EditPageContent from "./EditPageContent";

export default function EditPage() {
  return (
    <Suspense>
      <EditPageContent />
    </Suspense>
  );
} 