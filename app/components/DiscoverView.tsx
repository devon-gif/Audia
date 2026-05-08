"use client";

import { useState, useEffect } from "react";
import { fetchPodcastArtwork } from "@/utils/fetchPodcastArtwork";
import { Loader2, Compass } from "lucide-react";
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
}

export default function DiscoverView({ onSelectShow }: Props) {
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
          return (
            <button
              key={show.name}
              onClick={() => handleClick(show)}
              disabled={isLoading}
              title={show.name}
              className="group flex flex-col items-center gap-2 p-2 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-orange-500/20 transition-all"
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
          );
        })}
      </div>
    </div>
  );
}

interface Props {
  userId: string | null;
  favoriteRssUrls: Set<string>;
  onFavoriteToggle: (show: PodcastResult) => Promise<void>;
  onEpisodeSelect: (audioUrl: string, title: string, artwork: string) => void;
  onToast: (msg: string, type: "info" | "error") => void;
}

function fmtDate(raw: string) {
  if (!raw) return "";
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(raw));
  } catch { return raw; }
}

export default function DiscoverView({
  userId,
  favoriteRssUrls,
  onFavoriteToggle,
  onEpisodeSelect,
  onToast,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PodcastResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  // Expanded show — shows its episodes inline
  const [expandedShow, setExpandedShow] = useState<PodcastResult | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Which hearts are mid-toggle (optimistic loading state)
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || searching) return;
    setSearching(true);
    setSearched(false);
    setResults([]);
    setExpandedShow(null);
    try {
      const res = await fetch(`/api/podcasts/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResults(data.results ?? []);
      if ((data.results ?? []).length === 0) onToast("No podcasts found — try a different name.", "info");
    } catch (err) {
      onToast((err as Error).message, "error");
    } finally {
      setSearching(false);
      setSearched(true);
    }
  }, [query, searching, onToast]);

  const toggleExpand = async (show: PodcastResult) => {
    if (expandedShow?.trackId === show.trackId) {
      setExpandedShow(null);
      setEpisodes([]);
      return;
    }
    setExpandedShow(show);
    setEpisodes([]);
    setLoadingEpisodes(true);
    try {
      const res = await fetch(`/api/episodes?feedUrl=${encodeURIComponent(show.feedUrl)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load episodes");
      setEpisodes(data.episodes ?? []);
    } catch (err) {
      onToast((err as Error).message, "error");
      setExpandedShow(null);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  const handleHeartClick = async (show: PodcastResult) => {
    if (!userId) { onToast("Sign in to save favorites.", "error"); return; }
    if (togglingIds.has(show.trackId)) return;
    setTogglingIds(prev => new Set([...prev, show.trackId]));
    try {
      await onFavoriteToggle(show);
    } finally {
      setTogglingIds(prev => { const s = new Set(prev); s.delete(show.trackId); return s; });
    }
  };

  return (
    <div className="px-8 py-6 w-full max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-black tracking-tighter text-white">Discover</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Find shows, browse episodes, and save to your Auto-Distill list.</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-8">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search for a podcast — e.g. Huberman Lab, Lex Fridman…"
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          className="px-5 py-3 bg-gradient-to-r from-[#FF7A00] to-[#E05A00] rounded-xl text-white font-bold text-sm flex items-center gap-2 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,120,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {searching ? <Loader2 size={15} className="animate-spin" /> : <><Search size={14} /> Search</>}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((show) => {
            const isFaved = favoriteRssUrls.has(show.feedUrl);
            const isExpanded = expandedShow?.trackId === show.trackId;
            const isToggling = togglingIds.has(show.trackId);

            return (
              <div
                key={show.trackId}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isExpanded ? "border-orange-500/30 bg-white/[0.03]" : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                }`}
              >
                {/* Show row */}
                <div className="flex items-center gap-3 p-4">
                  {/* Artwork */}
                  <button
                    onClick={() => toggleExpand(show)}
                    className="shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-white/5 border border-white/10"
                  >
                    {show.artwork ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={show.artwork} alt={show.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Mic size={20} className="text-zinc-600" />
                      </div>
                    )}
                  </button>

                  {/* Info */}
                  <button
                    onClick={() => toggleExpand(show)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <p className="text-sm font-semibold text-white truncate leading-tight">{show.name}</p>
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">{show.author}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {show.genre && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                          {show.genre}
                        </span>
                      )}
                      {show.episodeCount > 0 && (
                        <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                          <Radio size={9} />
                          {show.episodeCount.toLocaleString()} eps
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Heart / Save */}
                    <button
                      onClick={() => handleHeartClick(show)}
                      disabled={isToggling}
                      title={isFaved ? "Remove from favorites" : "Save to Auto-Distill"}
                      className={`p-2 rounded-xl transition-all ${
                        isFaved
                          ? "text-rose-400 bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25"
                          : "text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20"
                      } disabled:opacity-40`}
                    >
                      {isToggling
                        ? <Loader2 size={15} className="animate-spin" />
                        : <Heart size={15} fill={isFaved ? "currentColor" : "none"} />}
                    </button>

                    {/* Expand toggle */}
                    <button
                      onClick={() => toggleExpand(show)}
                      className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent transition-all"
                    >
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>

                {/* Episode list (expanded) */}
                {isExpanded && (
                  <div className="border-t border-white/5 px-4 pb-4">
                    {loadingEpisodes ? (
                      <div className="flex items-center justify-center py-8 gap-3">
                        <Loader2 size={16} className="animate-spin text-orange-400" />
                        <span className="text-xs text-zinc-500">Loading episodes…</span>
                      </div>
                    ) : episodes.length === 0 ? (
                      <p className="text-xs text-zinc-600 text-center py-8">No episodes found in feed.</p>
                    ) : (
                      <div className="mt-3 space-y-1 max-h-72 overflow-y-auto pr-1">
                        {episodes.map((ep, i) => (
                          <button
                            key={i}
                            onClick={() => onEpisodeSelect(ep.audioUrl, ep.title, show.artwork)}
                            className="w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group"
                          >
                            <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                              <ArrowRight size={11} className="text-orange-400 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-zinc-200 line-clamp-2 leading-snug">{ep.title}</p>
                              <div className="flex items-center gap-3 mt-1">
                                {ep.pubDate && (
                                  <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                                    <Calendar size={9} /> {fmtDate(ep.pubDate)}
                                  </span>
                                )}
                                {ep.duration && (
                                  <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                                    <Clock size={9} /> {ep.duration}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {searched && results.length === 0 && !searching && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4">
            <Search size={22} className="text-zinc-600" />
          </div>
          <p className="text-sm font-semibold text-zinc-400">No results for &ldquo;{query}&rdquo;</p>
          <p className="text-xs text-zinc-600 mt-1">Try a different show name or topic.</p>
        </div>
      )}

      {/* Initial prompt */}
      {!searched && !searching && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mb-4">
            <Mic size={22} className="text-orange-400" />
          </div>
          <p className="text-sm font-semibold text-zinc-400">Search any podcast</p>
          <p className="text-xs text-zinc-600 mt-1">Type a show name or topic to get started.</p>
        </div>
      )}
    </div>
  );
}
