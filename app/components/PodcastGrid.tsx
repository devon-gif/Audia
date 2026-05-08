"use client";

import { useState, useEffect } from "react";
import { fetchPodcastArtwork } from "@/utils/fetchPodcastArtwork";
import { Loader2 } from "lucide-react";

const FEATURED_SHOWS = [
  "Huberman Lab",
  "Lex Fridman Podcast",
  "All-In Podcast",
  "The Tim Ferriss Show",
  "My First Million",
  "Diary of a CEO",
  "How I Built This",
  "Masters of Scale",
  "The Daily",
  "Conan O'Brien Needs a Friend",
  "Science Vs",
  "Naval Ravikant",
];

interface ShowCard {
  name: string;
  artwork: string | null;
  feedUrl: string | null;
  loaded: boolean;
}

export interface ShowSelection {
  name: string;
  artwork: string | null;
  feedUrl: string | null;
}

interface Props {
  onSelect?: (name: string) => void;
  onSelectShow?: (show: ShowSelection) => void;
}

export default function PodcastGrid({ onSelect, onSelectShow }: Props) {
  const [shows, setShows] = useState<ShowCard[]>(
    FEATURED_SHOWS.map((name) => ({ name, artwork: null, feedUrl: null, loaded: false }))
  );
  const [loadingShow, setLoadingShow] = useState<string | null>(null);

  useEffect(() => {
    FEATURED_SHOWS.forEach((name, i) => {
      fetchPodcastArtwork(name).then((artwork) => {
        setShows((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, artwork, loaded: true } : s))
        );
      });
      // Also prefetch feedUrl from iTunes
      fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=podcast&limit=1`)
        .then((r) => r.json())
        .then((data) => {
          const feedUrl: string | null = data.results?.[0]?.feedUrl ?? null;
          setShows((prev) =>
            prev.map((s, idx) => (idx === i ? { ...s, feedUrl } : s))
          );
        })
        .catch(() => {});
    });
  }, []);

  const handleClick = async (show: ShowCard) => {
    if (onSelectShow) {
      setLoadingShow(show.name);
      // feedUrl may still be loading — wait up to 3s
      let feedUrl = show.feedUrl;
      if (!feedUrl) {
        try {
          const res = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(show.name)}&entity=podcast&limit=1`
          );
          const data = await res.json();
          feedUrl = data.results?.[0]?.feedUrl ?? null;
        } catch { /* ignore */ }
      }
      setLoadingShow(null);
      onSelectShow({ name: show.name, artwork: show.artwork, feedUrl });
    } else {
      onSelect?.(show.name);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Popular Shows
        </span>
        <span className="text-[10px] text-zinc-600">Click to browse episodes</span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {shows.map((show) => (
          <button
            key={show.name}
            onClick={() => handleClick(show)}
            title={show.name}
            disabled={loadingShow === show.name}
            className="group relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-orange-500/30 hover:scale-105 transition-all duration-200 disabled:scale-100 disabled:cursor-wait"
          >
            {/* Blur-up placeholder */}
            {!show.loaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 animate-pulse" />
            )}
            {show.artwork && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={show.artwork}
                alt={show.name}
                className={`w-full h-full object-cover transition-opacity duration-500 ${show.loaded ? "opacity-100" : "opacity-0"}`}
              />
            )}
            {/* Loading spinner overlay */}
            {loadingShow === show.name && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <Loader2 size={18} className="text-orange-400 animate-spin" />
              </div>
            )}
            {/* Name overlay on hover */}
            {loadingShow !== show.name && (
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                <span className="text-[9px] text-white font-medium leading-tight line-clamp-2">{show.name}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
