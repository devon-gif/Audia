"use client";

/**
 * PodcastCover — resolves real iTunes artwork with blur-up fade-in.
 * Falls back to a deterministic Deep Glass gradient if the fetch fails.
 */

import { useState, useEffect } from "react";
import Image from "next/image";
import { gradientForName } from "@/lib/podcast-api";

interface Props {
  showName: string;
  size?: number;        // px, used for both width and height
  rounded?: string;     // tailwind class, e.g. "rounded-lg"
  className?: string;
  /** Pre-resolved URL — skip the client-side fetch if already known */
  artworkUrl?: string | null;
}

export default function PodcastCover({
  showName,
  size = 64,
  rounded = "rounded-xl",
  className = "",
  artworkUrl: initialUrl,
}: Props) {
  const [url, setUrl] = useState<string | null>(initialUrl ?? null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // If a URL was passed in props, no client-side fetch needed
    if (initialUrl !== undefined) return;
    let cancelled = false;
    fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(showName)}&entity=podcast&limit=1`
    )
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setUrl(data.results?.[0]?.artworkUrl600 ?? null);
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      });
    return () => { cancelled = true; };
  }, [showName, initialUrl]);

  const gradient = gradientForName(showName);
  const initial = showName.trim().charAt(0).toUpperCase();

  return (
    <div
      className={`relative overflow-hidden shrink-0 bg-gradient-to-br ${gradient} ${rounded} ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Gradient fallback — always rendered underneath */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white/60 font-black select-none" style={{ fontSize: size * 0.38 }}>
          {initial}
        </span>
      </div>

      {/* Real artwork — blur-up fade-in on load */}
      {url && !failed && (
        <Image
          src={url}
          alt={showName}
          fill
          sizes={`${size}px`}
          className={`object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          unoptimized={false}
        />
      )}
    </div>
  );
}
