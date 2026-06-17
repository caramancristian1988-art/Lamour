import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Niciun fișier trimis." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Fișierul trebuie să fie o imagine." }, { status: 400 });
  }

  try {
    const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("Vercel Blob upload failed:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Încărcarea a eșuat: ${detail}` },
      { status: 500 }
    );
  }
}
