"use client";

import { useState } from "react";
import { Search, Download, Trash2, ExternalLink, Clock, Calendar, Play } from "lucide-react";
import PodcastCover from "@/app/components/PodcastCover";

interface Props {
  onPlay?: (audioUrl: string, title: string) => void;
}

// ─── Mock data ─────────────────────────────────────────────────────────────
// showName drives real artwork lookups inside PodcastCover

const savedSummaries = [
  { id: 1, title: "The Art of Focus",       showName: "Cal Newport Deep Questions", date: "2 hours ago", length: "4m 32s", briefAudioUrl: null as string | null },
  { id: 2, title: "GPT-5 and the Future",   showName: "Lex Fridman Podcast",        date: "Yesterday",   length: "6m 18s", briefAudioUrl: null as string | null },
  { id: 3, title: "Dopamine Detox",         showName: "Huberman Lab",               date: "3 days ago",  length: "3m 45s", briefAudioUrl: null as string | null },
  { id: 4, title: "Crypto Market Analysis", showName: "Bankless",                   date: "1 week ago",  length: "8m 12s", briefAudioUrl: null as string | null },
  { id: 5, title: "Startup Fundraising",    showName: "Y Combinator Podcast",       date: "1 week ago",  length: "5m 22s", briefAudioUrl: null as string | null },
];

const recentShows = [
  "Huberman Lab",
  "Lex Fridman Podcast",
  "The Joe Rogan Experience",
  "The Daily",
  "The Tim Ferriss Show",
  "Planet Money",
  "Radiolab",
  "How I Built This",
  "The Knowledge Project",
  "Invest Like the Best",
  "My First Million",
  "Diary of a CEO",
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function LibraryView({ onPlay }: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = savedSummaries.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.showName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = async (audioUrl: string, title: string) => {
    try {
      const res = await fetch(audioUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(audioUrl, "_blank");
    }
  };

  const row1 = [...recentShows, ...recentShows];
  const row2 = [...recentShows.slice().reverse(), ...recentShows.slice().reverse()];
  const row3 = [...recentShows.slice(4), ...recentShows.slice(4)];

  return (
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