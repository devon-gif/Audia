/**
 * lib/podcast-api.ts
 * iTunes Search API wrapper with in-memory cache to avoid rate limits.
 */

// Module-level cache — persists for the lifetime of the process (dev) or lambda (prod)
const artworkCache = new Map<string, string | null>();

/**
 * Fetch the artworkUrl600 for a podcast by name.
 * Returns null if not found or if the request fails.
 * Results are cached in-memory to prevent redundant Apple API calls.
 */
export async function getPodcastArtwork(showName: string): Promise<string | null> {
  const key = showName.toLowerCase().trim();
  if (artworkCache.has(key)) return artworkCache.get(key)!;

  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(key)}&entity=podcast&limit=1`,
      // Next.js ISR cache: revalidate every hour
      { next: { revalidate: 3600 } } as RequestInit
    );
    if (!res.ok) {
      artworkCache.set(key, null);
      return null;
    }
    const data = await res.json();
    const url: string | null = data.results?.[0]?.artworkUrl600 ?? null;
    artworkCache.set(key, url);
    return url;
  } catch {
    artworkCache.set(key, null);
    return null;
  }
}

/** Deterministic "Deep Glass" gradient based on the first character of the show name. */
export function gradientForName(name: string): string {
  const gradients = [
    "from-blue-600 to-indigo-800",
    "from-violet-600 to-purple-900",
    "from-rose-600 to-pink-900",
    "from-amber-500 to-orange-800",
    "from-emerald-600 to-teal-900",
    "from-cyan-500 to-blue-800",
    "from-fuchsia-600 to-purple-900",
    "from-red-600 to-rose-900",
    "from-yellow-500 to-amber-800",
    "from-teal-500 to-emerald-800",
  ];
  const index = (name.charCodeAt(0) || 0) % gradients.length;
  return gradients[index];
}
