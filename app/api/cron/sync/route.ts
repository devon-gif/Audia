/**
 * GET /api/cron/sync
 *
 * Vercel Cron Job endpoint — runs daily to auto-distill new podcast episodes
 * for all subscribed users.
 *
 * Secured with CRON_SECRET env var. Configure in vercel.json:
 *
 *   {
 *     "crons": [{
 *       "path": "/api/cron/sync",
 *       "schedule": "0 8 * * *"
 *     }]
 *   }
 *
 * Vercel automatically adds Authorization: Bearer <CRON_SECRET> on each call.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Parser from "rss-parser";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Subscription {
  id: string;
  user_id: string;
  podcast_name: string;
  feed_url: string;
}

interface Profile {
  id: string;
  email: string | null;
  email_notifications: boolean;
}

interface RssItem {
  title?: string;
  pubDate?: string;
  enclosure?: { url?: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const rssParser = new Parser();

/** Returns true if the item was published in the last 24 hours. */
function isRecent(pubDate: string | undefined): boolean {
  if (!pubDate) return false;
  const published = new Date(pubDate).getTime();
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  return published > cutoff;
}

// ─── GET /api/cron/sync ───────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // ── Security: validate Vercel cron secret ──────────────────────────────────
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    console.error("[cron/sync] CRON_SECRET env var is not set — refusing to run.");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Service-role Supabase client (bypasses RLS) ────────────────────────────
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const startedAt = new Date().toISOString();
  const results: { userId: string; podcast: string; episodeTitle: string; status: string }[] = [];

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1: Fetch all active subscriptions
  // ─────────────────────────────────────────────────────────────────────────
  const { data: subscriptions, error: subError } = await supabase
    .from("subscriptions")
    .select("id, user_id, podcast_name, feed_url");

  if (subError) {
    console.error("[cron/sync] Failed to fetch subscriptions:", subError.message);
    return NextResponse.json({ error: "DB read failed" }, { status: 502 });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ message: "No subscriptions found. Nothing to process.", startedAt });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2: For each subscription, check RSS feed for new episodes in last 24h
  // ─────────────────────────────────────────────────────────────────────────
  for (const sub of subscriptions as Subscription[]) {
    let newEpisodes: RssItem[] = [];

    try {
      const feed = await rssParser.parseURL(sub.feed_url);
      newEpisodes = (feed.items as RssItem[]).filter((item) => isRecent(item.pubDate));
    } catch (err) {
      console.warn(`[cron/sync] Feed parse failed for "${sub.podcast_name}":`, (err as Error).message);
      results.push({ userId: sub.user_id, podcast: sub.podcast_name, episodeTitle: "—", status: "feed_error" });
      continue;
    }

    if (newEpisodes.length === 0) {
      // No new episodes since last run — skip silently
      continue;
    }

    // Fetch the user's profile for notification preferences (used in Step 4)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, email_notifications")
      .eq("id", sub.user_id)
      .maybeSingle() as { data: Profile | null };

    for (const episode of newEpisodes) {
      const audioUrl = episode.enclosure?.url;
      if (!audioUrl) continue;

      // ─────────────────────────────────────────────────────────────────────
      // STEP 3: Run the summarize + ElevenLabs pipeline
      //
      // TODO: Extract the core pipeline logic from /api/summarize/route.ts
      // into a shared utility (e.g. lib/pipeline.ts) so it can be called
      // both from the HTTP route and here without duplicating code.
      //
      // Pseudocode for when this is wired up:
      //
      //   const { brief, briefAudioUrl } = await runPipeline({
      //     userId: sub.user_id,
      //     audioUrl,
      //     length: "5m",
      //     voiceId: DEFAULT_VOICE_ID,
      //     source: "cron",
      //   });
      //
      // ─────────────────────────────────────────────────────────────────────

      // ─────────────────────────────────────────────────────────────────────
      // STEP 4: Send email notification if enabled
      //
      // TODO: Integrate Resend (https://resend.com) or SendGrid.
      //
      // Install: npm install resend
      //
      // Pseudocode:
      //
      //   if (profile?.email_notifications && profile?.email) {
      //     const resend = new Resend(process.env.RESEND_API_KEY!);
      //     await resend.emails.send({
      //       from: "Audia <briefs@getaudia.com>",
      //       to: profile.email,
      //       subject: `New Brief: ${episode.title ?? sub.podcast_name}`,
      //       html: buildBriefEmail({ episodeTitle: episode.title, briefAudioUrl, brief }),
      //     });
      //   }
      //
      // ─────────────────────────────────────────────────────────────────────

      // Log placeholder result for now
      results.push({
        userId: sub.user_id,
        podcast: sub.podcast_name,
        episodeTitle: episode.title ?? "Untitled",
        status: "pending_pipeline" // Will become "completed" once pipeline is wired
      });
    }
  }

  return NextResponse.json({
    message: "Cron sync complete (pipeline not yet wired — see comments in route.ts)",
    startedAt,
    processed: results.length,
    results,
  });
}
