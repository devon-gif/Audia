"use client";

import { useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import {
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Headphones, X,
} from "lucide-react";

function fmt(s: number) {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export default function StereoPlayer() {
  const { track, isPlaying, progress, duration, volume, toggle, seek, skip, setVolume, dismiss } = usePlayer();
  const [showVolume, setShowVolume] = useState(false);

  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const isMuted = volume === 0;

  /* ── Idle / empty state ─────────────────────────────────────────── */
  if (!track) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[100] flex items-center justify-center px-4 pb-3 pt-1 pointer-events-none">
        <div className="relative w-full max-w-3xl bg-black/50 backdrop-blur-xl border border-white/[0.06] border-t-white/[0.09] rounded-2xl pointer-events-auto min-h-[68px]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent rounded-t-2xl" />
          <div className="flex items-center gap-3 px-5 py-3">
            {/* Idle artwork placeholder */}
            <div className="shrink-0 w-11 h-11 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <Headphones size={17} className="text-zinc-700" />
            </div>

            {/* Idle label */}
            <div className="hidden sm:flex flex-col min-w-0 w-36 shrink-0">
              <span className="text-[11px] font-semibold text-zinc-600 truncate leading-tight">Ready to play…</span>
              <span className="text-[9px] text-zinc-700 uppercase tracking-widest mt-0.5">Audia Player</span>
            </div>

            {/* Idle waveform bars */}
            <div className="hidden md:flex items-end gap-[3px] h-5 shrink-0">
              {[3, 5, 8, 6, 10, 7, 4, 9, 5, 3].map((h, i) => (
                <div key={i} className="w-[3px] rounded-full bg-white/[0.05]" style={{ height: `${h * 2}px` }} />
              ))}
            </div>

            {/* Idle transport */}
            <div className="flex items-center gap-1.5 shrink-0 mx-auto">
              <button disabled suppressHydrationWarning={true} className="p-2 rounded-xl text-zinc-800 cursor-default"><RotateCcw size={15} /></button>
              <div className="w-11 h-11 rounded-full bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
                <Play size={15} className="text-zinc-700 ml-0.5" />
              </div>
              <button disabled suppressHydrationWarning={true} className="p-2 rounded-xl text-zinc-800 cursor-default"><RotateCw size={15} /></button>
            </div>

            {/* Idle scrubber */}
            <div className="flex-1 min-w-0 hidden sm:block">
              <div className="h-1.5 bg-white/[0.04] rounded-full" />
              <div className="flex justify-between mt-1">
                <span className="text-[9px] font-mono text-zinc-800">0:00</span>
                <span className="text-[9px] font-mono text-zinc-800">--:--</span>
              </div>
            </div>

            <div className="p-2 shrink-0"><Volume2 size={15} className="text-zinc-800" /></div>
            <div className="w-6 shrink-0" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] flex items-center justify-center px-4 pb-3 pt-1">
      {/* Stereo bar */}
      <div
        className={`
          relative w-full max-w-3xl
          bg-black/70 backdrop-blur-xl
          border rounded-2xl
          shadow-[0_-4px_60px_rgba(0,0,0,0.7)]
          transition-all duration-500
          ${isPlaying
            ? "border-orange-500/30 shadow-[0_-4px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(255,102,0,0.12)]"
            : "border-white/10"}
        `}
      >
        {/* Ambient glow line at top edge */}
        {isPlaying && (
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent rounded-full" />
        )}

        <div className="relative z-10 flex items-center gap-3 px-4 py-3">

          {/* Artwork */}
          <div className="shrink-0 w-11 h-11 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
            {track.artwork ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={track.artwork} alt="" className="w-full h-full object-cover" />
            ) : (
              <Headphones size={17} className="text-orange-400" />
            )}
          </div>

          {/* Track info */}
          <div className="hidden sm:flex flex-col min-w-0 w-36 shrink-0">
            <span className="text-[11px] font-bold text-white truncate leading-tight">{track.title}</span>
            <span className="text-[9px] text-zinc-500 truncate mt-0.5 uppercase tracking-widest">
              {isPlaying ? "Now Playing" : "Paused"}
            </span>
          </div>

          {/* Waveform animation */}
          <div className="hidden md:flex items-end gap-[3px] h-5 shrink-0">
            {[3, 5, 8, 6, 10, 7, 4, 9, 5, 3].map((h, i) => (
              <div
                key={i}
                className={`w-[3px] rounded-full transition-all ${isPlaying ? "bg-orange-500/70" : "bg-white/20"}`}
                style={isPlaying
                  ? { height: `${h * 2}px`, animation: `eq-bar ${0.6 + i * 0.07}s ease-in-out ${i * 80}ms infinite alternate` }
                  : { height: "4px" }}
              />
            ))}
          </div>

          {/* Transport controls */}
          <div className="flex items-center gap-1.5 shrink-0 mx-auto">
            <button
              onClick={() => skip(-15)}
              title="Back 15s"
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <RotateCcw size={15} />
            </button>

            <button
              onClick={toggle}
              aria-label={isPlaying ? "Pause" : "Play"}
              className={`
                w-11 h-11 rounded-full flex items-center justify-center shrink-0
                transition-all duration-300
                ${isPlaying
                  ? "bg-orange-500 shadow-[0_0_22px_rgba(255,102,0,0.6)] scale-105 hover:bg-orange-400"
                  : "bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105"}
              `}
            >
              {isPlaying
                ? <Pause size={16} fill="white" className="text-white" />
                : <Play size={15} fill="white" className="text-white ml-0.5" />}
            </button>

            <button
              onClick={() => skip(15)}
              title="Forward 15s"
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <RotateCw size={15} />
            </button>
          </div>

          {/* Progress bar + timestamps */}
          <div className="flex-1 min-w-0 hidden sm:block">
            <div
              role="slider"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={duration || 1}
              tabIndex={0}
              className="h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer group"
              onClick={(e) => {
                if (!duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                seek(((e.clientX - rect.left) / rect.width) * duration);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") skip(10);
                if (e.key === "ArrowLeft") skip(-10);
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-[#FF7A00] to-[#FF4400] rounded-full transition-[width] duration-100 group-hover:brightness-125"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] font-mono text-zinc-600">{fmt(progress)}</span>
              <span className="text-[9px] font-mono text-zinc-600">{duration ? fmt(duration) : "--:--"}</span>
            </div>
          </div>

          {/* Volume control */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowVolume(v => !v)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
              title="Volume"
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            {showVolume && (
              <div className="absolute bottom-full right-0 mb-2 flex flex-col items-center gap-1.5 p-2.5 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl">
                <input
                  type="range" min={0} max={1} step={0.02} value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="h-20 cursor-pointer accent-orange-500"
                  style={{ writingMode: "vertical-lr", direction: "rtl" }}
                />
                <span className="text-[9px] font-mono text-zinc-500">{Math.round(volume * 100)}%</span>
              </div>
            )}
          </div>

          {/* Dismiss */}
          <button
            onClick={dismiss}
            aria-label="Close player"
            className="p-2 rounded-xl text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-all shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes eq-bar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1.0); }
        }
      `}</style>
    </div>
  );
}