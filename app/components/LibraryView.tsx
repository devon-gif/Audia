"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Download, ExternalLink, Clock, Calendar, Play, RefreshCw } from "lucide-react";
import PodcastCover from "@/app/components/PodcastCover";

interface LibraryItem {
  id: string;
  source_url: string;
  summary_text: string;
  brief_audio_url: string | null;
  voice: string;
  created_at: string;
  brief_length: string;
}

interface Props {
  onPlay?: (audioUrl: string, title: string) => void;
}

// Derive a human-readable title from a URL
function titleFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const slug = u.pathname.split("/").filter(Boolean).pop() ?? "";
    return slug
      ? decodeURIComponent(slug).replace(/[-_]+/g, " ").replace(/\.\w+$/, "")
      : u.hostname;
  } catch {
    return url;
  }
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}


    <div className="flex-1 flex flex-col h-full">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-black tracking-tighter text-white mb-4">Knowledge Vault</h2>
        <div className="relative max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past briefs…"
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
          />
        </div>
      </div>

      {/* ── Recent Shows marquee ── */}
      <div className="mb-8">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Recent Shows</h3>
        <div className="space-y-2.5 overflow-hidden">
          <div className="flex gap-3">
            <div className="flex gap-3 animate-marquee-slow">
              {row1.map((show, i) => (
                <PodcastCover key={i} showName={show} size={80} rounded="rounded-xl"
                  className="cursor-pointer hover:scale-105 transition-transform duration-300 shadow-lg" />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex gap-3 animate-marquee-slow-reverse">
              {row2.map((show, i) => (
                <PodcastCover key={i} showName={show} size={68} rounded="rounded-lg"
                  className="cursor-pointer hover:scale-105 transition-transform duration-300 shadow-lg" />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex gap-3 animate-marquee-slow">
              {row3.map((show, i) => (
                <PodcastCover key={i} showName={show} size={56} rounded="rounded-lg"
                  className="cursor-pointer hover:scale-105 transition-transform duration-300 shadow-md" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Saved Briefs ── */}
      <div className="flex-1 min-h-0">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Saved Briefs</h3>

        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-4 py-2.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5">
          <div>Title / Source</div>
          <div>Date</div>
          <div>Length</div>
          <div>Actions</div>
        </div>

        <div className="space-y-0">
          {filtered.length === 0 ? (
            <p className="px-4 py-10 text-sm text-zinc-600 text-center">No briefs match your search.</p>
          ) : (
            filtered.map((summary) => (
              <div
                key={summary.id}
                className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-4 py-3.5 items-center hover:bg-white/[0.02] transition-colors border-b border-white/[0.04] group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <PodcastCover showName={summary.showName} size={40} rounded="rounded-lg" className="shadow-md" />
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{summary.title}</p>
                    <p className="text-zinc-500 text-[11px] truncate">{summary.showName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                  <Calendar size={11} className="shrink-0" />{summary.date}
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                  <Clock size={11} className="shrink-0" />{summary.length}
                </div>
                <div className="flex items-center gap-1">
                  {summary.briefAudioUrl && (
                    <button
                      onClick={() => onPlay?.(summary.briefAudioUrl!, summary.title)}
                      className="p-1.5 text-zinc-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Play brief"
                    >
                      <Play size={13} fill="currentColor" />
                    </button>
                  )}
                  <button
                    onClick={() => summary.briefAudioUrl && handleDownload(summary.briefAudioUrl, summary.title)}
                    disabled={!summary.briefAudioUrl}
                    className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Download mp3"
                  >
                    <Download size={13} />
                  </button>
                  <button className="p-1.5 text-zinc-500 hover:text-orange-400 hover:bg-white/5 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                    <ExternalLink size={13} />
                  </button>
                  <button className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}