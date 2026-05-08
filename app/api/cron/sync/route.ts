/**
 * GET /api/cron/sync
 *
 * Vercel Cron Job — runs daily at 08:00 UTC to auto-distill new podcast
 * episodes for all subscribed users and email the brief if notifications
 * are enabled.
 *
 * vercel.json:
 *   {
 *     "crons": [{ "path": "/api/cron/sync", "schedule": "0 8 * * *" }]
 *   }
 *
 * Vercel automatically injects: Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import Parser from "rss-parser";
import { runPipeline, DEFAULT_VOICE_ID } from "@/lib/pipeline";

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

function isRecent(pubDate: string | undefined): boolean {
  if (!pubDate) return false;
  return new Date(pubDate).getTime() > Date.now() - 24 * 60 * 60 * 1000;
}

/** Renders a formatted HTML email for a completed brief. */
function buildBriefEmail({
  podcastName,
  episodeTitle,
  brief,
  briefAudioUrl,
}: {
  podcastName: string;
  episodeTitle: string;
  brief: string;
  briefAudioUrl: string | null;
}): string {
  const briefHtml = brief
    .split("\n\n")
    .filter(Boolean)
    .map(
      (para) =>
        `<p style="margin:0 0 14px;font-size:14px;color:#333;line-height:1.75;">${para.replace(/\n/g, "<br/>")}</p>`
    )
    .join("");

  const listenButton = briefAudioUrl
    ? `<div style="text-align:center;margin:32px 0;">
        <a href="${briefAudioUrl}"
           style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#FF7A00,#E05A00);
                  color:white;font-weight:800;font-size:14px;text-decoration:none;border-radius:12px;
                  letter-spacing:-0.3px;box-shadow:0 4px 20px rgba(255,122,0,0.35);">
          &#9658;&nbsp;Listen to Brief
        </a>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.10);">
    <div style="background:linear-gradient(135deg,#FF7A00 0%,#E05A00 100%);padding:28px 32px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.2em;color:rgba(255,255,255,0.7);">Audia · Auto-Distill</p>
      <h1 style="margin:0;font-size:20px;font-weight:900;color:white;letter-spacing:-0.5px;">New Brief Ready</h1>
    </div>
    <div style="background:#1a1a1b;padding:20px 32px;border-bottom:1px solid rgba(255,255,255,0.06);">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#FF7A00;">${podcastName}</p>
      <p style="margin:0;font-size:15px;font-weight:700;color:white;">${episodeTitle}</p>
    </div>
    <div style="background:white;padding:32px;">
      <p style="margin:0 0 20px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.2em;color:#FF7A00;">Deep Signal Brief</p>
      ${briefHtml}
      ${listenButton}
      <div style="border-top:1px solid #eee;padding-top:20px;margin-top:8px;">
        <p style="margin:0;font-size:12px;color:#aaa;line-height:1.6;">
          You&rsquo;re receiving this because you enabled Auto-Distill for <strong>${podcastName}</strong>.<br>
          <a href="https://audia.ai/dashboard" style="color:#FF7A00;text-decoration:none;">Manage your subscriptions &rarr;</a>
        </p>
      </div>
    </div>
    <div style="background:#f4f4f5;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#999;">Audia &middot; AI-powered podcast distillation &middot; <a href="https://audia.ai" style="color:#FF7A00;text-decoration:none;">audia.ai</a></p>
    </div>
  </div>
</body>
</html>`;
}

// ─── GET /api/cron/sync ───────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // Vercel injects: Authorization: Bearer <CRON_SECRET>
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    console.error("[cron/sync] CRON_SECRET not set — refusing to run.");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const resend = new Resend(process.env.RESEND_API_KEY);
  const startedAt = new Date().toISOString();

  type ResultEntry = {
    userId: string;
    podcast: string;
    episodeTitle: string;
    status: "completed" | "emailed" | "feed_error" | "pipeline_error" | "no_audio";
    error?: string;
  };
  const results: ResultEntry[] = [];

  // ── STEP 1: Fetch all active subscriptions ────────────────────────────────
  const { data: subscriptions, error: subError } = await supabase
    .from("subscriptions")
    .select("id, user_id, podcast_name, feed_url");

  if (subError) {
    console.error("[cron/sync] DB read failed:", subError.message);
    return NextResponse.json({ error: "DB read failed" }, { status: 502 });
  }
  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ message: "No subscriptions — nothing to process.", startedAt });
  }

  // ── STEP 2: Check each RSS feed for episodes published in the last 24h ────
  for (const sub of subscriptions as Subscription[]) {
    let newEpisodes: RssItem[] = [];
    try {
      const feed = await rssParser.parseURL(sub.feed_url);
      newEpisodes = (feed.items as RssItem[]).filter((item) => isRecent(item.pubDate));
    } catch (err) {
      console.warn(`[cron/sync] Feed parse error "${sub.podcast_name}":`, (err as Error).message);
      results.push({
        userId: sub.user_id,
        podcast: sub.podcast_name,
        episodeTitle: "—",
        status: "feed_error",
        error: (err as Error).message,
      });
      continue;
    }

    if (newEpisodes.length === 0) continue;

    // Fetch user profile for email + notification preferences
    const { data: profile } = (await supabase
      .from("profiles")
      .select("id, email, email_notifications")
      .eq("id", sub.user_id)
      .maybeSingle()) as { data: Profile | null };

    for (const episode of newEpisodes) {
      const audioUrl = episode.enclosure?.url;
      const episodeTitle = episode.title ?? "Untitled Episode";

      if (!audioUrl) {
        results.push({ userId: sub.user_id, podcast: sub.podcast_name, episodeTitle, status: "no_audio" });
        continue;
      }

      // ── STEP 3: Create a pending DB record then run the full pipeline ──────
      const { data: genRow } = await supabase
        .from("audio_generations")
        .insert({
          user_id: sub.user_id,
          source_url: audioUrl,
          brief_length: "5m",
          status: "processing",
        })
        .select("id")
        .single();

      const recordId: string | null = genRow?.id ?? null;

      let brief: string;
      let briefAudioUrl: string | null;

      try {
        ({ brief, briefAudioUrl } = await runPipeline({
          supabase,
          userId: sub.user_id,
          sourceUrl: audioUrl,
          length: "5m",
          voiceId: DEFAULT_VOICE_ID,
          recordId,
        }));
      } catch (err) {
        console.error(`[cron/sync] Pipeline failed for "${episodeTitle}":`, (err as Error).message);
        if (recordId) {
          await supabase
            .from("audio_generations")
            .update({ status: "failed", error_message: (err as Error).message })
            .eq("id", recordId);
        }
        results.push({
          userId: sub.user_id,
          podcast: sub.podcast_name,
          episodeTitle,
          status: "pipeline_error",
          error: (err as Error).message,
        });
        continue;
      }

      results.push({ userId: sub.user_id, podcast: sub.podcast_name, episodeTitle, status: "completed" });

      // ── STEP 4: Email the brief if the user has notifications enabled ──────
      if (profile?.email_notifications && profile?.email) {
        try {
          await resend.emails.send({
            from: "Audia Briefs <briefs@audia.ai>",
            to: profile.email,
            subject: `New Brief: ${episodeTitle}`,
            html: buildBriefEmail({
              podcastName: sub.podcast_name,
              episodeTitle,
              brief,
              briefAudioUrl,
            }),
          });
          // Upgrade the last result entry to reflect delivery
          const last = results[results.length - 1];
          if (last) last.status = "emailed";
        } catch (emailErr) {
          console.warn(`[cron/sync] Email failed for ${profile.email}:`, (emailErr as Error).message);
        }
      }
    }
  }

  return NextResponse.json({
    message: "Cron sync complete.",
    startedAt,
    finishedAt: new Date().toISOString(),
    processed: results.length,
    results,
  });
}
