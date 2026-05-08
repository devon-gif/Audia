"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export interface Track {
  url: string;
  title: string;
  artwork?: string; // optional podcast cover URL
}

interface PlayerState {
  track: Track | null;
  isPlaying: boolean;
  progress: number;   // seconds elapsed
  duration: number;   // total seconds
}

interface PlayerActions {
  load: (track: Track) => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  skip: (delta: number) => void;   // e.g. +15 / -15
  setVolume: (v: number) => void;  // 0–1
  dismiss: () => void;
}

const PlayerContext = createContext<(PlayerState & PlayerActions) | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Lazily create the Audio element once (client-only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = new Audio();
    el.preload = "metadata";

    el.addEventListener("timeupdate", () => setProgress(el.currentTime));
    el.addEventListener("loadedmetadata", () => setDuration(el.duration));
    el.addEventListener("ended", () => setIsPlaying(false));

    audioRef.current = el;
    return () => {
      el.pause();
      el.src = "";
    };
  }, []);

  // When track changes, load + auto-play
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !track) return;
    el.src = track.url;
    el.load();
    setProgress(0);
    setDuration(0);
    const onCanPlay = () => {
      el.play().then(() => setIsPlaying(true)).catch(() => {});
      el.removeEventListener("canplaythrough", onCanPlay);
    };
    el.addEventListener("canplaythrough", onCanPlay);
    return () => el.removeEventListener("canplaythrough", onCanPlay);
  }, [track?.url]); // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback((t: Track) => setTrack(t), []);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) { el.pause(); setIsPlaying(false); }
    else { el.play().then(() => setIsPlaying(true)).catch(() => {}); }
  }, [isPlaying]);

  const seek = useCallback((seconds: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = seconds;
    setProgress(seconds);
  }, []);

  const dismiss = useCallback(() => {
    const el = audioRef.current;
    if (el) { el.pause(); el.src = ""; }
    setTrack(null);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
  }, []);

  return (
    <PlayerContext.Provider value={{ track, isPlaying, progress, duration, load, toggle, seek, dismiss }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}
