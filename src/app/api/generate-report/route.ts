import { NextRequest, NextResponse } from "next/server";
import { fetchAvailableFreeModels } from "@/lib/openrouter-models";
import { NALI_SYSTEM_PROMPT } from "@/lib/nali-system-prompt";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

async function callOpenRouter(model: string, prompt: string): Promise<string> {
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://naliai.vercel.app",
      "X-Title": "NaLI - Nature Life Intelligence",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: NALI_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    }),
  });

  if (res.status === 429) throw new Error("RATE_LIMITED");
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`MODEL_ERROR: ${res.status} ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("EMPTY_RESPONSE");
  return content as string;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, sessionId } = await req.json();

    if (!prompt || String(prompt).trim().length < 10) {
      return NextResponse.json(
        { error: "Prompt terlalu pendek. Tulis minimal 10 karakter." },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "Kapasitas AI belum dikonfigurasi. Hubungi admin.", code: "NO_API_KEY" },
        { status: 503 },
      );
    }

    const models = await fetchAvailableFreeModels();
    let result: string | null = null;
    let usedModel: string | null = null;
    let lastError = "";

    for (const model of models) {
      try {
        result = await callOpenRouter(model, String(prompt).trim());
        usedModel = model;
        break;
      } catch (e: any) {
        lastError = e.message ?? "unknown";
        await new Promise((r) => setTimeout(r, 300));
        continue;
      }
    }

    if (!result) {
      return NextResponse.json(
        {
          error: "Kapasitas AI sedang penuh. Coba lagi dalam beberapa menit.",
          code: "ALL_MODELS_UNAVAILABLE",
          lastError,
        },
        { status: 503 },
      );
    }

    // Save to Supabase if user is logged in
    const cookieStore = await cookies();
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "https://dummy.supabase.co";
    const cleanedUrl = rawUrl.replace(/\/rest\/v1\/?$/, "");
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "dummy";

    const supabase = createServerClient(cleanedUrl, anonKey, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch { /* read-only context */ }
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();

    let savedSessionId: string | null = sessionId ?? null;
    if (user) {
      const title = String(prompt).slice(0, 60) + (String(prompt).length > 60 ? "..." : "");
      if (sessionId) {
        await supabase
          .from("report_sessions")
          .update({ result, updated_at: new Date().toISOString() })
          .eq("id", sessionId)
          .eq("user_id", user.id);
      } else {
        const { data: newSession } = await supabase
          .from("report_sessions")
          .insert({ user_id: user.id, title, prompt: String(prompt), result })
          .select("id")
          .single();
        savedSessionId = newSession?.id ?? null;
      }
    }

    return NextResponse.json({ result, model: usedModel, sessionId: savedSessionId });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Terjadi kesalahan. Coba lagi.", detail: e.message },
      { status: 500 },
    );
  }
}
