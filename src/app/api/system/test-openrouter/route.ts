import { NextResponse } from "next/server";
import { getOpenRouterModels } from "@/lib/ai/openrouter";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENROUTER_API_KEY" }, { status: 400 });
  }

  const models = getOpenRouterModels();
  const results: any[] = [];

  for (const model of models.slice(0, 5)) {
    const start = Date.now();
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        body: JSON.stringify({
          messages: [
            { content: "respond with just the word: Hello", role: "user" },
          ],
          model,
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const duration = Date.now() - start;
      const status = response.status;
      const text = await response.text();

      results.push({
        model,
        duration,
        status,
        response: text.slice(0, 1000),
        ok: response.ok,
      });
    } catch (err: any) {
      results.push({
        model,
        duration: Date.now() - start,
        error: err.message || String(err),
        ok: false,
      });
    }
  }

  return NextResponse.json({
    primary: process.env.OPENROUTER_MODEL || process.env.NALI_OPENROUTER_MODEL || "none",
    results,
  });
}
