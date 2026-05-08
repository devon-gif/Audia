import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { AssemblyAI } from "assemblyai";
import OpenAI from "openai";
import Parser from "rss-parser";
import { ElevenLabsClient } from "elevenlabs";

// ─── Clients ──────────────────────────────────────────────────────────────────

const assemblyai = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

// ElevenLabs voice ID for "Brian" — a steady, authoritative premium voice
// Switch to your preferred voice ID from the ElevenLabs dashboard if desired
const ELEVENLABS_VOICE_ID = "nPczCjzI2devNBz1zQrb"; // Brian

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

  // ── 1b. Trial / subscription enforcement ─────────────────────────────────
  // Developer account always bypasses — never block heydevon@gmail.com
  const isDeveloper = user.email === "heydevon@gmail.com";
  if (!isDeveloper) {
    const anonCheck = await anonSupabase
      .from("profiles")
      .select("trial_ends_at, subscription_status")
      .eq("id", user.id)
      .maybeSingle();
    const profile = anonCheck.data;
    const status: string = profile?.subscription_status ?? "trialing";
    const isPro = status === "active" || status === "pro";
    if (!isPro) {
      const trialEndsAt: string | undefined = profile?.trial_ends_at;
      const trialExpired =
        !trialEndsAt || new Date(trialEndsAt).getTime() < Date.now();
      if (trialExpired) {
        return NextResponse.json(
          { error: "Your trial has expired. Upgrade to Pro to continue." },
          { status: 403 }
        );
      }
    }
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
      // speech_model is deprecated — use speech_models array instead
      speech_models: ["best"],
      language_detection: true,
    });
    // SDK polling resolves only when status is "completed" or "error"
    if (result.status !== "completed" || !result.text) {
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

  // ── 7. Text-to-Speech via ElevenLabs ────────────────────────────────────
  let briefAudioUrl: string | null = null;
  try {
    // Generate audio from the brief text
    const audioStream = await elevenlabs.textToSpeech.convert(ELEVENLABS_VOICE_ID, {
      text: brief,
      model_id: "eleven_turbo_v2_5",
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.85,
        style: 0.2,
        use_speaker_boost: true,
      },
    });

    // Collect the stream into a buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of audioStream) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    // Upload to Supabase Storage — audio-briefs bucket
    const fileName = `${user.id}/${recordId ?? Date.now()}.mp3`;
    const { error: uploadError } = await supabase.storage
      .from("audio-briefs")
      .upload(fileName, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from("audio-briefs")
        .getPublicUrl(fileName);
      briefAudioUrl = publicUrlData.publicUrl;
    } else {
      console.warn("[summarize] Storage upload failed:", uploadError.message);
    }
  } catch (err) {
    // TTS is non-fatal — we still return the text brief
    console.warn("[summarize] ElevenLabs TTS failed:", (err as Error).message);
  }

  // ── 8. Mark completed ────────────────────────────────────────────────────
  if (recordId) {
    await supabase
      .from("audio_generations")
      .update({
        summary_text: brief,
        brief_audio_url: briefAudioUrl,
        status: "completed",
      })
      .eq("id", recordId);
  }

  return NextResponse.json({
    id: recordId,
    brief,
    audioUrl,
    briefAudioUrl,
    transcriptLength: transcript.length,
  });
}
