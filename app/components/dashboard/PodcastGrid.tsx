"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Play, Sparkles } from "lucide-react";

export default function PodcastGrid() {
  const [favorites, setFavorites] = useState([]);
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

  useEffect(() => {
    const fetchFavs = async () => {
      const { data } = await supabase.from('user_favorites').select('*').limit(3);
      if (data) setFavorites(data);
    };
    fetchFavs();
  }, []);

  if (favorites.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {favorites.map((pod) => (
        <div key={pod.id} className="group relative aspect-square rounded-3xl overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl transition-all hover:scale-[1.02] hover:border-orange-500/50">
          {/* Podcast Cover */}
          <img src={pod.image_url} alt={pod.podcast_name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
          
          {/* Glassmorphic Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-6 flex flex-col justify-end">
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">Intelligence Feed</p>
            <h3 className="text-xl font-bold text-white leading-tight mb-4">{pod.podcast_name}</h3>
            
            <button className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-sm font-semibold hover:bg-white hover:text-black transition-all">
              <Sparkles size={16} />
              Distill Latest
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
