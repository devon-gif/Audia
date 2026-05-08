"use client";

import { useState, useEffect } from "react";
import { fetchPodcastArtwork } from "@/utils/fetchPodcastArtwork";

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
  loaded: boolean;
}

export default function PodcastGrid({ onSelect }: { onSelect?: (name: string) => void }) {
  const [shows, setShows] = useState<ShowCard[]>(
    FEATURED_SHOWS.map((name) => ({ name, artwork: null, loaded: false }))
  );

  useEffect(() => {
    FEATURED_SHOWS.forEach((name, i) => {
      fetchPodcastArtwork(name).then((artwork) => {
        setShows((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, artwork, loaded: true } : s))
        );
      });
    });
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Popular Shows
        </span>
        <span className="text-[10px] text-zinc-600">Click to pre-fill URL</span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {shows.map(({ name, artwork, loaded }) => (
          <button
            key={name}
            onClick={() => onSelect?.(name)}
            title={name}
            className="group relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-orange-500/30 hover:scale-105 transition-all duration-200"
          >
            {/* Blur-up placeholder */}
            {!loaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 animate-pulse" />
            )}
            {artwork && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artwork}
                alt={name}
                className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
              />
            )}
            {/* Name overlay on hover */}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
              <span className="text-[9px] text-white font-medium leading-tight line-clamp-2">{name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
