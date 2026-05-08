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
  let body: { text?: string; recordId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const OPENAI_VOICE = "onyx" as const;
  const { text, recordId } = body;
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: 'Missing required field: "text"' }, { status: 400 });
  }

  console.log(`[audio-route] userId=${user.id} voice=${OPENAI_VOICE} recordId=${recordId ?? "none"} chars=${text.length} keyPresent=${!!process.env.OPENAI_API_KEY}`);

  // ── OpenAI TTS ───────────────────────────────────────────────────────────
  let audioBuffer: Buffer;
  try {
    const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: OPENAI_VOICE,
        input: text.slice(0, 4096), // OpenAI TTS input limit
        response_format: "mp3",
      }),
    });

    if (!ttsRes.ok) {
      const errText = await ttsRes.text().catch(() => String(ttsRes.status));
      console.error(`[audio-route] OpenAI TTS error ${ttsRes.status}:`, errText);
      const is402 = ttsRes.status === 402 || errText.toLowerCase().includes("quota") || errText.toLowerCase().includes("insufficient");
      return NextResponse.json({ error: errText }, { status: is402 ? 402 : 502 });
    }

    audioBuffer = Buffer.from(await ttsRes.arrayBuffer());
  } catch (err) {
    const msg = err instanceof Error ? err.message : "OpenAI TTS request failed";
    console.error("[audio-route] TTS fetch error:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
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
