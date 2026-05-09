import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  
  if (!query) return NextResponse.json([]);

  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=podcast&limit=10`);
    const data = await res.json();
    
    const results = data.results.map((p: any) => ({
      id: p.collectionId,
      name: p.collectionName,
      artist: p.artistName,
      image: p.artworkUrl600,
      feed: p.feedUrl
    }));
    
    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
