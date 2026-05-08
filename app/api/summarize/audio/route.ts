/**
 * POST /api/summarize/audio
 *
 * Generates (or re-generates) a TTS audio brief from existing summary text.
 * Uploads to Supabase Storage bucket "summaries" and returns a permanent URL.
 *
 * Body: { text: string; voiceId?: string; recordId?: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ElevenLabsClient } from "elevenlabs";
import { DEFAULT_VOICE_ID } from "@/lib/pipeline";

const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY! });

export async function POST(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const anonSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await anonSupabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: { text?: string; voiceId?: string; recordId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { text, voiceId = DEFAULT_VOICE_ID, recordId } = body;
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: 'Missing required field: "text"' }, { status: 400 });
  }

  console.log(`[audio-route] userId=${user.id} voiceId=${voiceId} recordId=${recordId ?? "none"} chars=${text.length} keyPresent=${!!process.env.ELEVENLABS_API_KEY}`);

  // ── ElevenLabs TTS ──────────────────────────────────────────────────────────
  let audioBuffer: Buffer;
  try {
    const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
      text: text.slice(0, 5000), // ElevenLabs limit guard
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
    audioBuffer = Buffer.concat(chunks);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "ElevenLabs TTS failed";
    console.error("[audio] TTS error:", msg);
    // 402 from ElevenLabs means quota / billing limit — surface it with its own status
    const is402 = msg.includes("402") || msg.toLowerCase().includes("payment") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("insufficient");
    return NextResponse.json({ error: msg }, { status: is402 ? 402 : 502 });
  }

  // ── Upload to Supabase Storage ("summaries" bucket) ─────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );

  const fileName = `${user.id}/${recordId ?? `adhoc-${Date.now()}`}.mp3`;

  const { error: uploadError } = await supabase.storage
    .from("summaries")
    .upload(fileName, audioBuffer, { contentType: "audio/mpeg", upsert: true });

  if (uploadError) {
    console.error("[audio] Storage upload error:", uploadError.message);
    return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 502 });
  }

  const { data: publicUrlData } = supabase.storage.from("summaries").getPublicUrl(fileName);
  const audioUrl = publicUrlData.publicUrl;

  // ── Optionally backfill the audio_generations record ───────────────────────
  if (recordId) {
    await supabase
      .from("audio_generations")
      .update({ brief_audio_url: audioUrl })
      .eq("id", recordId)
      .eq("user_id", user.id); // safety: only update own records
  }

  return NextResponse.json({ audioUrl });
}
