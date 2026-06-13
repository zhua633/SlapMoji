import { NextRequest, NextResponse } from "next/server";

const defaultApiUrl = "https://slapmoji-backend.onrender.com";

type RouteContext = {
  params: Promise<{ effect: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { effect } = await context.params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl;
  const apiKey =
    process.env.SLAPMOJI_API_KEY ?? process.env.SLAPMOJI_DEV_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "SLAPMOJI_API_KEY is not configured." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const backendForm = new FormData();
  backendForm.append("file", file, file instanceof File ? file.name : "image");

  const res = await fetch(
    `${apiUrl.replace(/\/$/, "")}/api/v1/effects/${encodeURIComponent(effect)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: backendForm,
    }
  );

  if (!res.ok) {
    const text = await res.text();
    let message = text || "Effect request failed.";
    try {
      const json = JSON.parse(text) as { error?: string; message?: string };
      message = json.error ?? json.message ?? message;
    } catch {
      // use raw text
    }
    return NextResponse.json({ error: message }, { status: res.status });
  }

  const blob = await res.blob();
  return new NextResponse(blob, {
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "image/gif",
    },
  });
}
