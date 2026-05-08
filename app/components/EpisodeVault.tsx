"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2, Heart, Sparkles, Play } from "lucide-react";
import { type Episode } from "@/app/api/episodes/route";

interface Props {
  showName: string;
  artworkUrl?: string | null;
  feedUrl?: string | null;
  episodes: Episode[];
  loading: boolean;
  onSelect: (audioUrl: string) => void;
  onSummarize?: (audioUrl: string, title: string) => void;
  onListen?: (audioUrl: string, title: string) => void;
  isFavorited?: boolean;
  onFavoriteToggle?: (feedUrl: string) => void;
  onClose: () => void;
  onToast?: (message: string, type: "success" | "error" | "info") => void;
}

function formatDate(raw: string) {
  if (!raw) return "";
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(raw));
  } catch {
    return raw;
  }
}

export default function EpisodeVault({ 
  showName, 
  artworkUrl, 
  feedUrl, 
  episodes, 
  loading, 
  onSelect,
  onSummarize,
  onListen,
  isFavorited = false,
  onFavoriteToggle,
  onClose,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onToast: _onToast
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [headerImageError, setHeaderImageError] = useState(false);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm">
      {/* Panel — slides up */}
      <div
        ref={panelRef}
        className="w-full max-w-2xl mb-0 bg-black/95 border border-white/10 border-b-0 rounded-t-3xl shadow-[0_-20px_80px_rgba(0,0,0,0.8)] flex flex-col max-h-[80vh] animate-slide-up"
      >
        {/* Handle + Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            {artworkUrl && !headerImageError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={artworkUrl} 
                alt={showName} 
                className="w-10 h-10 rounded-xl object-cover"
                onError={() => setHeaderImageError(true)}
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6600] to-[#FF8A00] flex items-center justify-center shadow-[0_0_12px_rgba(255,102,0,0.3)]">
                <span className="text-base font-black text-white">{showName?.charAt(0)?.toUpperCase() || "?"}</span>
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">Episode Vault</p>
              <h3 className="text-sm font-black tracking-tighter text-white leading-none">{showName}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Favorites Button */}
            {feedUrl && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onFavoriteToggle?.(feedUrl); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                  isFavorited
                    ? "bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                    : "bg-white/[0.03] border-white/10 text-zinc-400 hover:border-rose-500/30 hover:text-rose-300"
                }`}
              >
                <Heart size={11} className={isFavorited ? "fill-rose-400 text-rose-400 shrink-0" : "shrink-0"} />
                {isFavorited ? "Favorited" : "Add to Favorites"}
                {isFavorited && <span className="w-1 h-1 rounded-full bg-rose-400 animate-pulse" />}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Episode list */}
        <div className="overflow-y-auto flex-1 px-2 py-2">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-zinc-500">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Fetching episodes…</span>
            </div>
          ) : episodes.length === 0 ? (
            <p className="text-center text-sm text-zinc-600 py-16">No episodes found in this feed.</p>
          ) : (
            episodes.map((ep, i) => (
              <div
                key={i}
                className="group flex items-start justify-between gap-4 px-4 py-3.5 rounded-xl hover:bg-orange-500/5 hover:border-orange-500/20 border border-transparent transition-all cursor-default"
              >
                {/* Episode info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-orange-100 transition-colors">
                    {ep.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-zinc-500">{formatDate(ep.pubDate)}</span>
                    {ep.duration && (
                      <>
                        <span className="text-zinc-700">·</span>
                        <span className="text-[10px] text-zinc-500">{ep.duration}</span>
                      </>
                    )}
                  </div>
                  {ep.snippet && (
                    <p className="text-[11px] text-zinc-600 mt-1 line-clamp-2 leading-relaxed">{ep.snippet}</p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="shrink-0 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all">
                  {/* Listen */}
                  <button
                    onClick={() => onListen ? onListen(ep.audioUrl, ep.title) : onSelect(ep.audioUrl)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 hover:border-white/20 text-zinc-300 text-[11px] font-bold transition-all"
                  >
                    <Play size={9} fill="currentColor" />
                    Listen
                  </button>
                  {/* Summarize */}
                  <button
                    onClick={() => onSummarize ? onSummarize(ep.audioUrl, ep.title) : onSelect(ep.audioUrl)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 hover:border-orange-500/60 text-orange-400 text-[11px] font-bold transition-all shadow-[0_0_10px_rgba(255,102,0,0.1)] hover:shadow-[0_0_16px_rgba(255,102,0,0.25)]"
                  >
                    <Sparkles size={10} />
                    Summarize
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/5 shrink-0">
          <p className="text-[10px] text-zinc-600 text-center">
            Hover an episode · <span className="text-zinc-400 font-semibold">Listen</span> to play instantly or <span className="text-orange-500/70 font-semibold">Summarize</span> for an AI brief.
          </p>
        </div>
      </div>

    </div>
  );
}
