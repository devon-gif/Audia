"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Check, Loader2, Sparkles } from "lucide-react";

export default function Onboarding() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const searchPodcasts = async (val: string) => {
    setQuery(val);
    if (val.length < 3) return;
    setLoading(true);
    const res = await fetch(`/api/podcasts/search?q=${val}`);
    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  const toggleSelect = (podcast: any) => {
    if (selected.find(s => s.id === podcast.id)) {
      setSelected(selected.filter(s => s.id !== podcast.id));
    } else if (selected.length < 3) {
      setSelected([...selected, podcast]);
    }
  };

  
  const finish = async () => {
    const supabase = createClientComponentClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    // 1. Save the Big 3
    const { error: favError } = await supabase
      .from('user_favorites')
      .insert(selected.map(p => ({
        user_id: user.id,
        podcast_name: p.name,
        artist_name: p.artist,
        image_url: p.image,
        rss_url: p.feed,
        itunes_id: String(p.id)
      })));

    if (favError) {
      console.error("Error saving favorites:", favError);
      return;
    }

    // 2. Mark onboarding as complete
    await supabase
      .from('profiles')
      .update({ has_completed_onboarding: true })
      .eq('id', user.id);

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            Your Intelligence Brief
          </h1>
          <p className="text-zinc-400">Pick 3 podcasts to personalize your dashboard signals.</p>
        </div>

        {/* Selected Slots */}
        <div className="flex justify-center gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-24 h-24 rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/50 flex items-center justify-center overflow-hidden">
              {selected[i] ? (
                <img src={selected[i].image} className="w-full h-full object-cover" />
              ) : (
                <Sparkles className="text-zinc-700" size={20} />
              )}
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-orange-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, host, or topic..."
            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-lg"
            onChange={(e) => searchPodcasts(e.target.value)}
          />
        </div>

        {/* Search Results */}
        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {loading && <Loader2 className="animate-spin mx-auto text-zinc-500" />}
          {results.map((p: any) => (
            <button 
              key={p.id} 
              onClick={() => toggleSelect(p)}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all ${selected.find(s => s.id === p.id) ? 'bg-orange-500/10 border border-orange-500/50' : 'hover:bg-zinc-900 border border-transparent'}`}
            >
              <img src={p.image} className="w-12 h-12 rounded-lg" />
              <div className="text-left flex-1">
                <p className="text-sm font-bold truncate">{p.name}</p>
                <p className="text-xs text-zinc-500 truncate">{p.artist}</p>
              </div>
              {selected.find(s => s.id === p.id) && <Check size={16} className="text-orange-500" />}
            </button>
          ))}
        </div>

        <button 
          disabled={selected.length < 3}
          onClick={finish}
          className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-orange-500 hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black transition-all"
        >
          {selected.length === 3 ? "Complete Your Studio" : `Pick ${3 - selected.length} more`}
        </button>
      </div>
    </div>
  );
}
