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
  let body: { url?: string; length?: "3m" | "5m" | "10m"; voiceId?: string; bypassCredits?: boolean; targetLanguage?: "en" | "es" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { url, length = "5m", voiceId = DEFAULT_VOICE_ID, targetLanguage = "en" } = body;
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: 'Missing required field: "url"' }, { status: 400 });
  }

  // ── 2b. Cache check ───────────────────────────────────────────────────────
  // Return a previous generation instantly — no OpenAI calls, no credit spend.
  const { data: cached } = await supabase
    .from("audio_generations")
    .select("id, summary_text, brief_audio_url, transcript_text")
    .eq("source_url", url)
    .eq("voice", voiceId)
    .eq("status", "completed")
    .not("summary_text", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (cached?.summary_text) {
    console.log("[summarize] cache HIT — id=%s voice=%s", cached.id, voiceId);
    return NextResponse.json({
      id: cached.id,
      brief: cached.summary_text,
      audioUrl: cached.brief_audio_url ?? null,
      briefAudioUrl: cached.brief_audio_url ?? null,
      transcriptLength: cached.transcript_text?.length ?? 0,
      newMonthlyGenerations: isDeveloper ? null : monthlyGenerations,
      fromCache: true,
    });
  }

  // ── 3. Create a pending DB record ─────────────────────────────────────────
  const userId = user.id; // captured once — user is non-null past auth check above
  const { data: generation } = await supabase
    .from("audio_generations")
    .insert({ user_id: userId, source_url: url, brief_length: length, status: "processing", voice: voiceId })
    .select("id")
    .single();

  const recordId: string | null = generation?.id ?? null;

  // ── 3b. Pre-deduct credit so double-submits can't race past the cap ────────
  let creditDeducted = false;
  if (!isDeveloper) {
    const { error: deductError } = await supabase
      .from("profiles")
      .update({ monthly_generations: monthlyGenerations + 1 })
      .eq("id", userId);
    if (deductError) {
      console.error("[summarize] credit deduction failed:", deductError.message);
    } else {
      creditDeducted = true;
      monthlyGenerations += 1; // keep local var in sync
    }
  }

  async function fail(message: string, httpStatus = 502): Promise<NextResponse> {
    // Refund the pre-deducted credit on any pipeline failure
    if (creditDeducted) {
      await supabase
        .from("profiles")
        .update({ monthly_generations: monthlyGenerations - 1 })
        .eq("id", userId);
    }
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
      userId,
      sourceUrl: url,
      length,
      voiceId,
      targetLanguage,
      recordId,
    }));
  } catch (err) {
    return fail((err as Error).message);
  }

  // ── 9. Return — credit was already deducted before pipeline ─────────────
  return NextResponse.json({
    id: recordId,
    brief,
    audioUrl: resolvedAudioUrl,
    briefAudioUrl,
    transcriptLength,
    newMonthlyGenerations: isDeveloper ? null : monthlyGenerations,
  });
}
