"use client";

import { usePlayer } from "@/contexts/PlayerContext";
import { Play, Headphones } from "lucide-react";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export default function GlobalPlayer() {
  const { track, isPlaying, progress, duration, toggle, seek, dismiss } = usePlayer();

  if (!track) return null;

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div
      className={`
        shrink-0 mx-6 mt-4 mb-0 relative
        bg-black/60 backdrop-blur-2xl
        border rounded-2xl
        transition-all duration-500
        ${isPlaying
          ? "border-orange-500/40 shadow-[0_0_32px_rgba(255,102,0,0.20)]"
          : "border-white/10"}
      `}
    >
      {/* Glow pulse while playing */}
      {isPlaying && (
        <div className="absolute inset-0 rounded-2xl bg-orange-500/[0.04] animate-pulse pointer-events-none" />
      )}

      <div className="relative z-10 flex items-center gap-3 px-4 py-3">
        {/* Artwork thumbnail */}
        <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
          {track.artwork ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={track.artwork} alt="" className="w-full h-full object-cover" />
          ) : (
            <Headphones size={16} className="text-orange-400" />
          )}
        </div>

        {/* Play / Pause */}
        <button
          onClick={toggle}
          aria-label={isPlaying ? "Pause" : "Play"}
          className={`
            w-9 h-9 rounded-full flex items-center justify-center shrink-0
            transition-all duration-300
            ${isPlaying
              ? "bg-orange-500 shadow-[0_0_18px_rgba(255,102,0,0.55)] scale-105"
              : "bg-white/10 border border-white/20 hover:bg-white/20"}
          `}
        >
          {isPlaying ? (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="white">
              <rect x="3" y="2" width="4" height="12" rx="1" />
              <rect x="9" y="2" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <Play size={13} fill="white" className="text-white ml-0.5" />
          )}
        </button>

        {/* Track info + scrubber */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest truncate leading-none">
              {track.title}
            </span>
            <span className={`text-[10px] font-mono shrink-0 ml-3 leading-none ${isPlaying ? "text-orange-400/80" : "text-zinc-500"}`}>
              {isPlaying ? "Playing…" : duration ? fmt(duration) : "--:--"}
            </span>
          </div>

          {/* Progress bar — clickable scrubber */}
          <div
            role="slider"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={duration || 1}
            tabIndex={0}
            className="h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => {
              if (!duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              seek(((e.clientX - rect.left) / rect.width) * duration);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") seek(Math.min(progress + 10, duration));
              if (e.key === "ArrowLeft") seek(Math.max(progress - 10, 0));
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-[#FF7A00] to-[#FF4400] rounded-full transition-[width] duration-100"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Time labels */}
          <div className="flex justify-between mt-1">
            <span className="text-[9px] font-mono text-zinc-600">{fmt(progress)}</span>
            <span className="text-[9px] font-mono text-zinc-600">{duration ? fmt(duration) : "--:--"}</span>
          </div>
        </div>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          aria-label="Close player"
          className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-all shrink-0"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 1l8 8M9 1L1 9" />
          </svg>
        </button>
      </div>
    </div>
  );
}
