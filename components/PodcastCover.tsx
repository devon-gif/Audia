"use client";

import { useState, useEffect } from "react";

interface PodcastCoverProps {
  podcastName: string;
  fallbackUrl?: string | null;
  className?: string;
}

export default function PodcastCover({ 
  podcastName, 
  fallbackUrl,
  className = "",
}: PodcastCoverProps) {
  const [artworkUrl, setArtworkUrl] = useState<string | null>(fallbackUrl || null);
  const [loading, setLoading] = useState(!fallbackUrl);
  const [error, setError] = useState(false);

  useEffect(() => {
    // If we already have a fallback URL, use it
    if (fallbackUrl) {
      setArtworkUrl(fallbackUrl);
      setLoading(false);
      return;
    }

    // Otherwise fetch from our API
    const fetchArtwork = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(
          `/api/podcast-art?podcastName=${encodeURIComponent(podcastName)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch artwork");
        }

        const data = await response.json();
        
        if (data.artworkUrl) {
          setArtworkUrl(data.artworkUrl);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("[PodcastCover] Error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [podcastName, fallbackUrl]);

  // Deep Glass skeleton loader
  if (loading) {
    return (
      <div 
        className={`bg-gray-800 animate-pulse rounded-xl aspect-square ${className}`}
        style={{ 
          background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
        }}
      />
    );
  }

  // Error state - show initials fallback
  if (error || !artworkUrl) {
    const initials = podcastName
      .split(" ")
      .slice(0, 2)
      .map(word => word[0])
      .join("")
      .toUpperCase();

    return (
      <div 
        className={`bg-white/5 border border-white/10 rounded-xl aspect-square flex items-center justify-center ${className}`}
      >
        <span className="text-xl font-bold text-zinc-500">{initials}</span>
      </div>
    );
  }

  // Success - show artwork
  return (
    <img
      src={artworkUrl}
      alt={podcastName}
      className={`rounded-xl aspect-square object-cover ${className}`}
      loading="lazy"
    />
  );
}
