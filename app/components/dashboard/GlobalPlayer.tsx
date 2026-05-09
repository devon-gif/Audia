'use client';
import { useEffect, useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Play, Pause, X } from 'lucide-react';

export default function StereoPlayer() {
  const [mounted, setMounted] = useState(false);
  const { isPlaying, progress, duration, toggle, dismiss, track } = usePlayer();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !track) return null;

  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative w-full bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-0.5">Deep Signal Brief</p>
            <p className="text-xs font-semibold text-white truncate">{track.title}</p>
          </div>
          <button onClick={() => toggle()} className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-all">
            {isPlaying ? <Pause size={18} className="text-black" /> : <Play size={18} className="text-black ml-0.5" />}
          </button>
          <button onClick={() => dismiss()} className="p-2 text-zinc-500 hover:text-white transition-colors"><X size={16} /></button>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-[10px] font-mono text-zinc-500">{formatTime(progress)}</span>
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[10px] font-mono text-zinc-500">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}