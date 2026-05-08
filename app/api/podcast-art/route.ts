/**
 * GET /api/podcast-art?podcastName={name}
 *
 * Fetches podcast artwork from Apple's iTunes API.
 * Returns the high-resolution artworkUrl600.
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const podcastName = searchParams.get("podcastName");

    if (!podcastName || podcastName.trim() === "") {
      return NextResponse.json(
        { error: "Missing podcastName parameter" },
        { status: 400 }
      );
    }

    // Encode the podcast name for URL
    const encodedName = encodeURIComponent(podcastName.trim());
    
    // Fetch from Apple's iTunes API
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodedName}&entity=podcast&limit=1`,
      {
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`iTunes API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.resultCount === 0 || !data.results?.[0]) {
      return NextResponse.json(
        { error: "No podcast found" },
        { status: 404 }
      );
    }

    const podcast = data.results[0];
    const artworkUrl = podcast.artworkUrl600 || podcast.artworkUrl100 || podcast.artworkUrl60;

    if (!artworkUrl) {
      return NextResponse.json(
        { error: "No artwork available" },
        { status: 404 }
      );
    }

    // Return with cache headers - cache for 7 days
    return NextResponse.json(
      {
        artworkUrl,
        feedUrl: podcast.feedUrl ?? null,
        podcastName: podcast.collectionName,
        artistName: podcast.artistName,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error: any) {
    console.error("[podcast-art] Error fetching artwork:", error);
    return NextResponse.json(
      { error: "Failed to fetch artwork", details: error.message },
      { status: 500 }
    );
  }
}
