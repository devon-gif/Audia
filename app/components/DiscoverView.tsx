"use client";

import { useState, useEffect } from "react";
import { fetchPodcastArtwork } from "@/utils/fetchPodcastArtwork";
import { Loader2, Compass, Star } from "lucide-react";
import type { ShowSelection } from "@/app/components/PodcastGrid";

const FEATURED_SHOWS = [
  { name: "Huberman Lab",                 category: "Science" },
  { name: "Lex Fridman Podcast",          category: "Technology" },
  { name: "All-In Podcast",               category: "Business" },
  { name: "The Tim Ferriss Show",         category: "Self-Improvement" },
  { name: "My First Million",             category: "Business" },
  { name: "Diary of a CEO",               category: "Business" },
  { name: "How I Built This",             category: "Entrepreneurship" },
  { name: "Masters of Scale",             category: "Business" },
  { name: "The Daily",                    category: "News" },
  { name: "Conan O'Brien Needs a Friend", category: "Comedy" },
  { name: "Science Vs",                   category: "Science" },
  { name: "Naval Ravikant",               category: "Philosophy" },
  { name: "SmartLess",                    category: "Comedy" },
  { name: "Stuff You Should Know",        category: "Education" },
  { name: "99% Invisible",               category: "Design" },
  { name: "Hidden Brain",                 category: "Psychology" },
  { name: "Darknet Diaries",              category: "Technology" },
  { name: "Acquired",                     category: "Business" },
];

const CATEGORIES = [
  "All", "Business", "Technology", "Science", "Self-Improvement",
  "Comedy", "Education", "News", "Philosophy", "Design", "Psychology", "Entrepreneurship",
];

interface ShowCard {
  name: string;
  category: string;
  artwork: string | null;
  feedUrl: string | null;
  loaded: boolean;
}

interface Props {
  onSelectShow: (show: ShowSelection) => void;
  favoriteRssUrls?: Set<string>;
  onFavoriteToggle?: (show: ShowSelection & { feedUrl: string }) => void;
}

export default function DiscoverView({ onSelectShow, favoriteRssUrls = new Set(), onFavoriteToggle }: Props) {
  const [shows, setShows] = useState<ShowCard[]>(
    FEATURED_SHOWS.map((s) => ({ ...s, artwork: null, feedUrl: null, loaded: false }))
  );
  const [loadingShow, setLoadingShow] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    FEATURED_SHOWS.forEach((show, i) => {
      fetchPodcastArtwork(show.name).then((artwork) => {
        setShows((prev) => prev.map((s, idx) => idx === i ? { ...s, artwork, loaded: true } : s));
      });
      fetch(`/api/podcast-art?podcastName=${encodeURIComponent(show.name)}`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          const feedUrl: string | null = data?.feedUrl ?? null;
          setShows((prev) => prev.map((s, idx) => idx === i ? { ...s, feedUrl } : s));
        })
        .catch(() => {});
    });
  }, []);

  const handleClick = async (show: ShowCard) => {
    setLoadingShow(show.name);
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
  };

  const filtered = activeCategory === "All"
    ? shows
    : shows.filter((s) => s.category === activeCategory);

  return (
    <div className="px-8 py-6 w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Compass size={16} className="text-orange-400" />
          <h1 className="text-lg font-black tracking-tighter text-white">Discover</h1>
        </div>
        <p className="text-xs text-zinc-500">
          Curated shows — click any card to browse episodes and generate your AI brief.
        </p>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
              activeCategory === cat
                ? "bg-orange-500/20 border border-orange-500/40 text-orange-300"
                : "bg-white/[0.03] border border-white/10 text-zinc-500 hover:text-zinc-300 hover:border-white/20"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Show grid */}
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {filtered.map((show) => {
          const isLoading = loadingShow === show.name;
          const isFaved = show.feedUrl ? favoriteRssUrls.has(show.feedUrl) : false;
          return (
            <div key={show.name} className="relative group">
              <button
                onClick={() => handleClick(show)}
                disabled={isLoading}
                title={show.name}
                className="w-full flex flex-col items-center gap-2 p-2 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-orange-500/20 transition-all"
              >
                {/* Artwork */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/[0.06] shadow-md group-hover:shadow-[0_0_20px_rgba(255,102,0,0.15)] transition-shadow">
                  {show.artwork ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={show.artwork}
                      alt={show.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                      <span className="text-xl font-black text-zinc-600">{show.name.charAt(0)}</span>
                    </div>
                  )}
                  {/* Hover overlay / loading */}
                  <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/8 transition-colors duration-300 flex items-center justify-center">
                    {isLoading && <Loader2 size={20} className="text-white animate-spin drop-shadow-lg" />}
                  </div>
                </div>

                {/* Label */}
                <div className="w-full text-center px-0.5">
                  <p className="text-[11px] font-semibold text-zinc-300 group-hover:text-white transition-colors leading-tight line-clamp-2">
                    {show.name}
                  </p>
                  <p className="text-[9px] text-zinc-600 mt-0.5 uppercase tracking-wider">{show.category}</p>
                </div>
              </button>

              {/* Star / Favorite button */}
              {show.feedUrl && (
                <button
                  onClick={(e) => { e.stopPropagation(); if (show.feedUrl) onFavoriteToggle?.({ name: show.name, artwork: show.artwork, feedUrl: show.feedUrl }); }}
                  title={isFaved ? "Remove from favorites" : "Add to favorites"}
                  className={`absolute top-3 right-3 p-1.5 rounded-lg backdrop-blur-sm transition-all hover:scale-110 active:scale-95 ${
                    isFaved
                      ? "opacity-100 bg-black/40"
                      : "opacity-0 group-hover:opacity-100 bg-black/30 hover:bg-black/50"
                  }`}
                >
                  <Star
                    size={13}
                    className={isFaved ? "text-orange-400" : "text-white/70 hover:text-orange-400"}
                    fill={isFaved ? "currentColor" : "none"}
                  />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}