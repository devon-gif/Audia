import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { AssemblyAI } from "assemblyai";
import OpenAI from "openai";
import Parser from "rss-parser";

// ─── Clients ──────────────────────────────────────────────────────────────────

const assemblyai = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const rssParser = new Parser();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** True when the URL is likely an RSS/Atom feed rather than a direct audio file. */
function looksLikeFeed(url: string): boolean {
  return !url.match(/\.(mp3|mp4|m4a|ogg|wav|aac)(\?.*)?$/i);
}

/** Extract the most recent audio enclosure URL from an RSS feed. */
async function extractAudioFromFeed(feedUrl: string): Promise<string> {
  const feed = await rssParser.parseURL(feedUrl);
  const firstItem = feed.items.find(
    (item) => item.enclosure?.url && item.enclosure.url.length > 0
  );
  if (!firstItem?.enclosure?.url) {
    throw new Error("No audio enclosure found in feed. Try pasting a direct episode URL.");
  }
  return firstItem.enclosure.url;
}

// ─── POST /api/summarize ───────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── 1. Auth ───────────────────────────────────────────────────────────────
  // Anon client — used only to verify the caller's session cookie
  const anonSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await anonSupabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Service-role client — bypasses RLS for DB writes
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );

  // ── 2. Parse & validate body ──────────────────────────────────────────────
  let body: { url?: string; length?: "3m" | "5m" | "10m" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { url, length = "5m" } = body;
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: 'Missing required field: "url"' }, { status: 400 });
  }

  const wordTargets: Record<string, number> = { "3m": 450, "5m": 750, "10m": 1500 };
  const targetWords = wordTargets[length] ?? 750;

  // ── 3. Create a pending DB record ─────────────────────────────────────────
  const { data: generation } = await supabase
    .from("audio_generations")
    .insert({ user_id: user.id, source_url: url, brief_length: length, status: "processing" })
    .select("id")
    .single();

  const recordId: string | null = generation?.id ?? null;

  /** Mark the DB record as failed and return an error response. */
  async function fail(message: string, httpStatus = 502): Promise<NextResponse> {
    if (recordId) {
      await supabase
        .from("audio_generations")
        .update({ status: "failed", error_message: message })
        .eq("id", recordId);
    }
    console.error("[summarize] failed:", message);
    return NextResponse.json({ error: message, id: recordId }, { status: httpStatus });
  }

  // ── 4. Resolve audio URL (RSS → direct mp3) ───────────────────────────────
  let audioUrl = url;
  try {
    if (looksLikeFeed(url)) {
      audioUrl = await extractAudioFromFeed(url);
    }
    if (recordId) {
      await supabase
        .from("audio_generations")
        .update({ audio_url: audioUrl })
        .eq("id", recordId);
    }
  } catch (err) {
    return fail((err as Error).message, 422);
  }

  // ── 5. Transcribe via AssemblyAI (SDK handles polling internally) ─────────
  let transcript: string;
  try {
    const result = await assemblyai.transcripts.transcribe({
      audio_url: audioUrl,
      speech_model: "best",
      language_detection: true,
    });
    if (result.status === "error" || !result.text) {
      throw new Error(result.error ?? "Transcription returned empty result");
    }
    transcript = result.text;
    if (recordId) {
      await supabase
        .from("audio_generations")
        .update({ transcript_text: transcript })
        .eq("id", recordId);
    }
  } catch (err) {
    return fail(`Transcription failed: ${(err as Error).message}`);
  }

  // ── 6. Distil via gpt-4o-mini ─────────────────────────────────────────────
  const systemPrompt = `You are an elite research assistant. Take this podcast transcript and create a "Deep Signal" brief.

Rules:
- Focus on high-level insights, contrarian takes, and actionable data.
- Surface the three most important ideas with precision — distil, do not summarize.
- Include a "Key Quotes" section (2–3 verbatim lines worth remembering).
- Include an "Action Items" section (3–5 concrete next steps the listener can take today).
- Format for a professional listener who has ${length} to extract the core value.
- Tone: sharp, direct, zero filler. No "in this episode" preambles.
- Target length: ~${targetWords} words.`;

  let brief: string;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `TRANSCRIPT:\n\n${transcript.slice(0, 100_000)}` },
      ],
      temperature: 0.4,
    });
    brief = completion.choices[0]?.message?.content ?? "";
    if (!brief) throw new Error("Model returned an empty response");
  } catch (err) {
    return fail(`Distillation failed: ${(err as Error).message}`);
  }

  // ── 7. Mark completed ────────────────────────────────────────────────────
  if (recordId) {
    await supabase
      .from("audio_generations")
      .update({ summary_text: brief, status: "completed" })
      .eq("id", recordId);
  }

  return NextResponse.json({
    id: recordId,
    brief,
    audioUrl,
    transcriptLength: transcript.length,
  });
}
