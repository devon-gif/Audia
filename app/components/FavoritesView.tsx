"use client";

import { Star, Loader2, Headphones } from "lucide-react";
import type { ShowSelection } from "@/app/components/PodcastGrid";

interface FavoriteRow {
  podcast_id: string;
  podcast_name: string;
  image_url: string | null;
  rss_url: string;
}

interface Props {
  userId: string | null;
  favoriteShowObjects: Map<string, FavoriteRow>;
  favoriteShows: Set<string>;
  onSelectShow: (show: ShowSelection) => void;
  onFavoriteToggle: (
    showOrFeedUrl:
      | { trackId: number; name: string; artwork: string; feedUrl: string }
      | string,
    legacyName?: string
  ) => void;
}

export default function FavoritesView({
  favoriteShowObjects,
  favoriteShows,
  onSelectShow,
  onFavoriteToggle,
}: Props) {
  const shows = Array.from(favoriteShowObjects.values());

  return (
    <div className="px-8 py-6 w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Star size={16} className="text-orange-400" fill="currentColor" />
          <h1 className="text-lg font-black tracking-tighter text-white">Favorites</h1>
        </div>
        <p className="text-xs text-zinc-500">
          Your saved shows — click any card to browse episodes and generate an AI brief.
        </p>
      </div>

      {shows.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-5">
            <Star size={24} className="text-orange-400/60" />
          </div>
          <p className="text-sm font-semibold text-zinc-400 mb-1">No favorites yet</p>
          <p className="text-xs text-zinc-600 max-w-xs leading-relaxed">
            Star a show from the <span className="text-zinc-400">Discover</span> or{" "}
            <span className="text-zinc-400">New Summary</span> search results and it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {shows.map((show) => {
            const isFaved = favoriteShows.has(show.rss_url);
            return (
              <div key={show.rss_url} className="relative group">
                <button
                  onClick={() =>
                    onSelectShow({
                      name: show.podcast_name,
                      artwork: show.image_url,
                      feedUrl: show.rss_url,
                    })
                  }
                  className="w-full flex flex-col items-center gap-2 p-2 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-orange-500/20 transition-all"
                >
                  {/* Artwork */}
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/[0.06] shadow-md group-hover:shadow-[0_0_20px_rgba(255,102,0,0.15)] transition-shadow">
                    {show.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={show.image_url}
                        alt={show.podcast_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                        <Headphones size={20} className="text-zinc-600" />
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/8 transition-colors duration-300" />
                  </div>

                  {/* Label */}
                  <div className="w-full text-center px-0.5">
                    <p className="text-[11px] font-semibold text-zinc-300 group-hover:text-white transition-colors leading-tight line-clamp-2">
                      {show.podcast_name}
                    </p>
                  </div>
                </button>

                {/* Star toggle — always visible since these are favorited */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavoriteToggle(
                      { trackId: 0, name: show.podcast_name, artwork: show.image_url ?? "", feedUrl: show.rss_url }
                    );
                  }}
                  title="Remove from favorites"
                  className={`absolute top-3 right-3 p-1.5 rounded-lg backdrop-blur-sm transition-all hover:scale-110 active:scale-95 ${
                    isFaved ? "opacity-100 bg-black/40" : "opacity-0 group-hover:opacity-100 bg-black/30"
                  }`}
                >
                  <Star
                    size={13}
                    className={isFaved ? "text-orange-400" : "text-white/70"}
                    fill={isFaved ? "currentColor" : "none"}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Auto-Distill note */}
      {shows.length > 0 && (
        <p className="mt-8 text-[10px] text-zinc-700 text-center">
          <Loader2 size={9} className="inline mr-1 animate-spin" />
          Auto-Distill is active — new episodes from these shows generate AI briefs automatically.
        </p>
      )}
    </div>
  );
}
