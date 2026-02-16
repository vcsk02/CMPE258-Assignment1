// app/app/api/rewrite/route.ts
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs"; // keep it on Node runtime (server-side)

type Style = "pirate" | "corporate" | "haiku";

function styleInstruction(style: Style) {
  switch (style) {
    case "pirate":
      return "Rewrite as a short pirate-flavored command. Keep meaning. One sentence.";
    case "corporate":
      return "Rewrite as a concise corporate task with professional tone. One sentence.";
    case "haiku":
      return "Rewrite as a haiku (5-7-5 syllables). Keep meaning.";
  }
}

export async function POST(req: Request) {
  try {
    const { text, style } = (await req.json()) as { text: string; style: Style };

    if (!process.env.GEMINI_API_KEY) {
      return new NextResponse("Missing GEMINI_API_KEY", { status: 500 });
    }
    if (!text || typeof text !== "string") {
      return new NextResponse("Invalid text", { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // You can swap model names if your account supports others.
    // Keep it simple & available: flash is typically fast/cheap.
    const model = "gemini-2.5-flash";

    const prompt = [
      "You are a helpful assistant that rewrites TODO items.",
      styleInstruction(style),
      "Return ONLY the rewritten todo text. No quotes. No extra commentary.",
      `TODO: ${text}`,
    ].join("\n");

    const resp = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const rewritten = (resp.text ?? "").trim();
    if (!rewritten) return new NextResponse("Empty model response", { status: 500 });

    return NextResponse.json({ rewritten });
  } catch (e: any) {
    return new NextResponse(e?.message ?? String(e), { status: 500 });
  }
}
