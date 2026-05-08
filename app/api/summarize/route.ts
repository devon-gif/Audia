import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { AssemblyAI } from "assemblyai";
import OpenAI from "openai";
import Parser from "rss-parser";

// ─── Clients ──────────────────────────────────────────────────────────────────

const assemblyai = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY ?? "",
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

const rssParser = new Parser();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true if the URL looks like an RSS / Atom feed rather than a direct audio file. */
function looksLikeFeed(url: string): boolean {
  return (
    url.includes("feeds.") ||
    url.includes("/feed") ||
    url.includes("/rss") ||
    url.endsWith(".xml") ||
    url.includes("podcast") ||
    !url.match(/\.(mp3|mp4|m4a|ogg|wav|aac)$/i)
  );
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

// ─── Loading stage labels (returned as SSE or used by client polling) ─────────
export const STAGES = [
  "Fetching feed…",
  "Submitting to transcription engine…",
  "Analyzing waveforms…",
  "Neural distillation in progress…",
  "Composing Deep Signal brief…",
  "Persisting to library…",
];

// ─── POST /api/summarize ───────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── 1. Auth ──────────────────────────────────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Build a server-side Supabase client that reads cookies from the request
  let response = NextResponse.next();
  const supabase = createServerClient(supabaseUrl, supabaseServiceKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Parse body ─────────────────────────────────────────────────────────────
  let body: { url?: string; length?: "3m" | "5m" | "10m" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { url, length = "5m" } = body;
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Missing or invalid `url` field" }, { status: 400 });
  }

  // Map length to approximate word count target for the brief
  const wordTargets: Record<string, number> = { "3m": 450, "5m": 750, "10m": 1500 };
  const targetWords = wordTargets[length] ?? 750;

  // ── 3. Resolve audio URL ───────────────────────────────────────────────────────
  let audioUrl = url;
  try {
    if (looksLikeFeed(url)) {
      audioUrl = await extractAudioFromFeed(url);
    }
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message ?? "Could not parse feed" },
      { status: 422 }
    );
  }

  // ── 4. Transcribe via AssemblyAI ──────────────────────────────────────────────
  let transcript: string;
  try {
    const result = await assemblyai.transcripts.transcribe({
      audio_url: audioUrl,
      speech_model: "best",
      language_detection: true,
    });

    if (result.status === "error" || !result.text) {
      throw new Error(result.error ?? "Transcription failed");
    }
    transcript = result.text;
  } catch (err) {
    return NextResponse.json(
      { error: `Transcription error: ${(err as Error).message}` },
      { status: 502 }
    );
  }

  // ── 5. Distil via GPT-4o ──────────────────────────────────────────────────────
  const systemPrompt = `You are an elite research assistant and intelligence analyst. 
Take the following podcast transcript and create a "Deep Signal" brief.

Rules:
- Focus on high-level insights, contrarian takes, and actionable data.
- Surface the three most important ideas with precision — not summaries, but distillations.
- Include a "Key Quotes" section (2–3 verbatim lines worth remembering).
- Include an "Action Items" section (3–5 concrete next steps the listener can take today).
- Write for a professional listener who has ${length} to absorb the core value of a long-form conversation.
- Tone: sharp, direct, zero filler. No "in this episode" preambles.
- Target length: approximately ${targetWords} words.

Do not summarize — distill.`;

  let brief: string;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `TRANSCRIPT:\n\n${transcript.slice(0, 120000)}`, // ~90k token budget
        },
      ],
      temperature: 0.4,
    });
    brief = completion.choices[0]?.message?.content ?? "";
    if (!brief) throw new Error("Empty response from model");
  } catch (err) {
    return NextResponse.json(
      { error: `Distillation error: ${(err as Error).message}` },
      { status: 502 }
    );
  }

  // ── 6. Persist to Supabase ────────────────────────────────────────────────────
  const { data: generation, error: dbError } = await supabase
    .from("audio_generations")
    .insert({
      user_id: user.id,
      source_url: url,
      audio_url: audioUrl,
      transcript_text: transcript,
      summary_text: brief,
      brief_length: length,
      status: "completed",
    })
    .select("id")
    .single();

  if (dbError) {
    // Non-fatal — return the brief even if DB write fails
    console.error("[summarize] DB insert error:", dbError.message);
  }

  return NextResponse.json({
    id: generation?.id ?? null,
    brief,
    audioUrl,
    transcriptLength: transcript.length,
  });
}
