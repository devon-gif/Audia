/**
 * Hits the iTunes Search API to resolve a podcast name → artworkUrl600.
 * Returns null if nothing is found or the fetch fails.
 */
export async function fetchPodcastArtwork(podcastName: string): Promise<string | null> {
  try {
    const res = await fetch(
      `/api/podcast-art?podcastName=${encodeURIComponent(podcastName)}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.artworkUrl ?? null;
  } catch {
    return null;
  }
}
