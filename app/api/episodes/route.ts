import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser();

export type Episode = {
  title: string;
  pubDate: string;
  snippet: string;
  audioUrl: string;
  duration: string;
};

export async function GET(request: NextRequest) {
  const feedUrl = request.nextUrl.searchParams.get("feedUrl");
  if (!feedUrl) {
    return NextResponse.json({ error: "Missing feedUrl parameter" }, { status: 400 });
  }

  let feed;
  try {
    feed = await parser.parseURL(feedUrl);
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to parse feed: ${(err as Error).message}` },
      { status: 502 }
    );
  }

  const episodes: Episode[] = feed.items
    .slice(0, 20)
    .filter((item) => item.enclosure?.url)
    .map((item) => ({
      title: item.title ?? "Untitled Episode",
      pubDate: item.pubDate ?? "",
      snippet: (item.contentSnippet ?? item.content ?? "").slice(0, 120).trim(),
      audioUrl: item.enclosure!.url!,
      duration: (item as Record<string, unknown>)["itunes:duration"] as string ?? "",
    }));

  return NextResponse.json({ episodes });
}
