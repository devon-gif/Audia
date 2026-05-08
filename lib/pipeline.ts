/**
 * lib/pipeline.ts
 *
 * Shared summarization pipeline: audio URL resolution → AssemblyAI transcription
 * → GPT-4o-mini distillation → ElevenLabs TTS → Supabase Storage upload.
 *
 * Used by both /api/summarize (user-triggered) and /api/cron/sync (automated).
 */

import { AssemblyAI } from "assemblyai";
import OpenAI from "openai";
import { ElevenLabsClient } from "elevenlabs";
import Parser from "rss-parser";
import type { SupabaseClient } from "@supabase/supabase-js";

// ─── Singletons ───────────────────────────────────────────────────────────────

const assemblyai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY! });
const rssParser = new Parser();

// ─── Constants ────────────────────────────────────────────────────────────────

/** Default ElevenLabs voice: Rachel (calm, warm) */
export const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

/** Monthly generation credit caps per plan tier */
export const CREDIT_CAPS: Record<string, number> = {
  free: 3,
  pro: 15,
  max: 100,
};

// ─── URL helpers ──────────────────────────────────────────────────────────────

/** Returns true when the URL is likely an RSS/Atom feed rather than a direct audio file. */
export function looksLikeFeed(url: string): boolean {
  return !url.match(/\.(mp3|mp4|m4a|ogg|wav|aac)(\?.*)?$/i);
}

/** Extract the most recent audio enclosure URL from an RSS feed. */
export async function extractAudioFromFeed(feedUrl: string): Promise<string> {
  const feed = await rssParser.parseURL(feedUrl);
  const firstItem = feed.items.find(
    (item) => item.enclosure?.url && item.enclosure.url.length > 0
  );
  if (!firstItem?.enclosure?.url) {
    throw new Error("No audio enclosure found in feed. Try pasting a direct episode URL.");
  }
  return firstItem.enclosure.url;
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

export interface PipelineOptions {
  /** Supabase service-role client (for DB writes + storage uploads). */
  supabase: SupabaseClient;
  /** Authenticated user ID. */
  userId: string;
  /** Original URL — can be an RSS feed URL or a direct audio file URL. */
  sourceUrl: string;
  /** Desired brief length: 3, 5, or 10 minutes. Defaults to "5m". */
  length?: "3m" | "5m" | "10m";
  /** ElevenLabs voice ID. Falls back to DEFAULT_VOICE_ID. */
  voiceId?: string;
  /**
   * ID of an existing `audio_generations` row to keep updated with live status.
   * Pass null/undefined when the cron creates its own record inline.
   */
  recordId?: string | null;
}

export interface PipelineResult {
  brief: string;
  briefAudioUrl: string | null;
  resolvedAudioUrl: string;
  transcriptLength: number;
}

/**
 * runPipeline — core processing flow.
 *
 * Throws on any unrecoverable error so callers can catch + mark the DB row
 * as "failed" themselves. TTS errors are non-fatal: briefAudioUrl will be null.
 */
export async function runPipeline(opts: PipelineOptions): Promise<PipelineResult> {
  const {
    supabase,
    userId,
    sourceUrl,
    length = "5m",
    voiceId = DEFAULT_VOICE_ID,
    recordId,
  } = opts;

  const wordTargets: Record<string, number> = { "3m": 450, "5m": 750, "10m": 1500 };
  const targetWords = wordTargets[length] ?? 750;

  // ── Step 1: Resolve RSS feed → direct audio URL ──────────────────────────
  let audioUrl = sourceUrl;
  if (looksLikeFeed(sourceUrl)) {
    audioUrl = await extractAudioFromFeed(sourceUrl);
  }
  if (recordId) {
    await supabase
      .from("audio_generations")
      .update({ audio_url: audioUrl })
      .eq("id", recordId);
  }

  // ── Step 2: Transcribe via AssemblyAI ────────────────────────────────────
  const transcriptResult = await assemblyai.transcripts.transcribe({
    audio_url: audioUrl,
    speech_models: ["universal-3-pro", "universal-2"] as string[],
    language_detection: true,
  });

  if (transcriptResult.status !== "completed" || !transcriptResult.text) {
    throw new Error(
      `Transcription failed: ${transcriptResult.error ?? "empty result from AssemblyAI"}`
    );
  }

  const transcript = transcriptResult.text;

  if (recordId) {
    await supabase
      .from("audio_generations")
      .update({ transcript_text: transcript })
      .eq("id", recordId);
  }

  // ── Step 3: Distil via GPT-4o-mini ──────────────────────────────────────
  const systemPrompt = `You are an elite research assistant. Take this podcast transcript and create a "Deep Signal" brief.

Rules:
- Focus on high-level insights, contrarian takes, and actionable data.
- Surface the three most important ideas with precision — distil, do not summarize.
- Include a "Key Quotes" section (2–3 verbatim lines worth remembering).
- Include an "Action Items" section (3–5 concrete next steps the listener can take today).
- Format for a professional listener who has ${length} to extract the core value.
- Tone: sharp, direct, zero filler. No "in this episode" preambles.
- Target length: ~${targetWords} words.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `TRANSCRIPT:\n\n${transcript.slice(0, 100_000)}` },
    ],
    temperature: 0.4,
  });

  const brief = completion.choices[0]?.message?.content ?? "";
  if (!brief) throw new Error("GPT returned an empty brief.");

  // ── Step 4: Text-to-Speech via ElevenLabs ────────────────────────────────
  let briefAudioUrl: string | null = null;
  try {
    const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
      text: brief,
      model_id: "eleven_turbo_v2_5",
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.85,
        style: 0.2,
        use_speaker_boost: true,
      },
    });

    const chunks: Uint8Array[] = [];
    for await (const chunk of audioStream) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    // ── Step 5: Upload to Supabase Storage ──────────────────────────────────
    const fileName = `${userId}/${recordId ?? Date.now()}.mp3`;
    const { error: uploadError } = await supabase.storage
      .from("audio-briefs")
      .upload(fileName, audioBuffer, { contentType: "audio/mpeg", upsert: true });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from("audio-briefs")
        .getPublicUrl(fileName);
      briefAudioUrl = publicUrlData.publicUrl;
    } else {
      console.warn("[pipeline] Storage upload failed:", uploadError.message);
    }
  } catch (err) {
    // TTS is non-fatal — text brief is still returned
    console.warn("[pipeline] ElevenLabs TTS failed:", (err as Error).message);
  }

  // ── Step 6: Mark DB record as completed ──────────────────────────────────
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

  return {
    brief,
    briefAudioUrl,
    resolvedAudioUrl: audioUrl,
    transcriptLength: transcript.length,
  };
}
