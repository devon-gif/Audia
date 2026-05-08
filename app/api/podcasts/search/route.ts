import { NextRequest, NextResponse } from "next/server";

export type PodcastResult = {
  trackId: number;       // iTunes unique ID — used as podcast_id
  name: string;
  author: string;
  artwork: string;       // 600×600 artwork URL
  feedUrl: string;       // RSS URL — saved as rss_url in user_favorites
  episodeCount: number;
  genre: string;
};

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "Missing q parameter" }, { status: 400 });
  }

  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=podcast&entity=podcast&limit=12&country=US`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Audia/1.0" },
      // 5-second timeout
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`iTunes API error ${res.status}`);
    const data = await res.json();

    const results: PodcastResult[] = (data.results ?? [])
      .filter((r: Record<string, unknown>) => r.feedUrl)           // only shows with an RSS feed
      .map((r: Record<string, unknown>) => ({
        trackId:      r.trackId as number,
        name:         r.collectionName as string,
        author:       r.artistName as string,
        artwork:      (r.artworkUrl600 ?? r.artworkUrl100) as string,
        feedUrl:      r.feedUrl as string,
        episodeCount: (r.trackCount as number) ?? 0,
        genre:        (r.primaryGenreName as string) ?? "",
      }));

    return NextResponse.json({ results });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
