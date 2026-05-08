import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { DEFAULT_VOICE_ID, CREDIT_CAPS, runPipeline } from "@/lib/pipeline";

// ─── POST /api/summarize ──────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── 1. Auth ───────────────────────────────────────────────────────────────
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
  const isDeveloper = user.email === "heydevon@gmail.com";

  let planTier = "free";
  let monthlyGenerations = 0;
  if (!isDeveloper) {
    const anonCheck = await anonSupabase
      .from("profiles")
      .select("trial_ends_at, subscription_status, plan_tier, monthly_generations")
      .eq("id", user.id)
      .maybeSingle();
    const profile = anonCheck.data;
    const status: string = profile?.subscription_status ?? "trialing";
    const isPro = status === "active" || status === "pro";
    if (!isPro) {
      const trialEndsAt: string | undefined = profile?.trial_ends_at;
      const trialExpired = !trialEndsAt || new Date(trialEndsAt).getTime() < Date.now();
      if (trialExpired) {
        return NextResponse.json(
          { error: "Your trial has expired. Upgrade to Pro to continue." },
          { status: 403 }
        );
      }
    }
    planTier = (profile?.plan_tier as string | null) ?? "free";
    monthlyGenerations = (profile?.monthly_generations as number | null) ?? 0;
  }

  // ── 1c. Credit cap enforcement ────────────────────────────────────────────
  if (!isDeveloper) {
    const cap = CREDIT_CAPS[planTier] ?? CREDIT_CAPS.free;
    if (monthlyGenerations >= cap) {
      const messages: Record<string, string> = {
        free: `Free tier limit reached (${cap}/month). Upgrade to Pro to continue.`,
        pro: `Pro tier limit reached (${cap}/month). Upgrade to Max for unlimited access.`,
        max: `Fair use limit reached (${cap}/month). Contact support if you need more.`,
      };
      return NextResponse.json(
        { error: messages[planTier] ?? messages.free, upgradeRequired: true },
        { status: 403 }
      );
    }
  }

  // Service-role client for DB writes
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );

  // ── 2. Parse & validate body ──────────────────────────────────────────────
  let body: { url?: string; length?: "3m" | "5m" | "10m"; voiceId?: string; bypassCredits?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { url, length = "5m", voiceId = DEFAULT_VOICE_ID } = body;
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: 'Missing required field: "url"' }, { status: 400 });
  }

  // ── 3. Create a pending DB record ─────────────────────────────────────────
  const { data: generation } = await supabase
    .from("audio_generations")
    .insert({ user_id: user.id, source_url: url, brief_length: length, status: "processing" })
    .select("id")
    .single();

  const recordId: string | null = generation?.id ?? null;

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

  // ── 4-8. Core pipeline (transcribe → distil → TTS → storage → DB) ─────────
  let brief: string;
  let briefAudioUrl: string | null;
  let resolvedAudioUrl: string;
  let transcriptLength: number;

  try {
    ({ brief, briefAudioUrl, resolvedAudioUrl, transcriptLength } = await runPipeline({
      supabase,
      userId: user.id,
      sourceUrl: url,
      length,
      voiceId,
      recordId,
    }));
  } catch (err) {
    return fail((err as Error).message);
  }

  // ── 9. Increment credit counter ───────────────────────────────────────────
  if (!isDeveloper) {
    await supabase
      .from("profiles")
      .update({ monthly_generations: monthlyGenerations + 1 })
      .eq("id", user.id);
  }

  return NextResponse.json({
    id: recordId,
    brief,
    audioUrl: resolvedAudioUrl,
    briefAudioUrl,
    transcriptLength,
  });
}
