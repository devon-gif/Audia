/**
 * Hits the iTunes Search API to resolve a podcast name → artworkUrl600.
 * Returns null if nothing is found or the fetch fails.
 */
export async function fetchPodcastArtwork(podcastName: string): Promise<string | null> {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(podcastName)}&media=podcast&limit=1`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.results?.[0]?.artworkUrl600 ?? null;
  } catch {
    return null;
  }
}
