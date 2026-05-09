"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Search, Check, Sparkles, ArrowRight, PlayCircle, BookOpen, Zap, X } from "lucide-react";

export default function OnboardingWizard() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // 1-3: Intro, 4: Podcast Pick
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  
  
  useEffect(() => {
    const handleTrigger = () => setIsOpen(true);
    window.addEventListener("trigger-onboarding", handleTrigger);
    return () => window.removeEventListener("trigger-onboarding", handleTrigger);
  }, []);

  useEffect(() => {
    const handleTrigger = () => setIsOpen(true);
    window.addEventListener("trigger-onboarding", handleTrigger);
    return () => window.removeEventListener("trigger-onboarding", handleTrigger);
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('has_completed_onboarding').eq('id', user.id).single();
      if (!profile?.has_completed_onboarding) setIsOpen(true);
    };
    checkStatus();
  }, []);

  const searchPodcasts = async (val: string) => {
    setQuery(val);
    if (val.length < 3) return;
    setLoading(true);
    const res = await fetch(`/api/podcasts/search?q=${val}`);
    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  const finish = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('user_favorites').insert(selected.map(p => ({
      user_id: user.id,
      podcast_name: p.name,
      artist_name: p.artist,
      image_url: p.image,
      rss_url: p.feed,
      itunes_id: String(p.id)
    })));

    await supabase.from('profiles').update({ has_completed_onboarding: true }).eq('id', user.id);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
        
        {/* Progress Bar */}
        <div className="h-1 bg-white/5 flex">
          {[1,2,3,4].map(i => (
            <div key={i} className={`flex-1 transition-all duration-500 ${step >= i ? 'bg-orange-500' : ''}`} />
          ))}
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto text-orange-500">
                <Zap size={32} />
              </div>
              <h2 className="text-2xl font-bold">Welcome to Audia</h2>
              <p className="text-zinc-400">Transform hours of podcast audio into high-fidelity narrative briefs in seconds.</p>
              <button onClick={() => setStep(2)} className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2">
                Show me how <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="text-center space-y-6 animate-in fade-in">
              <PlayCircle className="mx-auto text-orange-500" size={48} />
              <h2 className="text-2xl font-bold">Deep Signal Engine</h2>
              <p className="text-zinc-400">Paste any RSS or episode link. Choose your length (3m, 5m, or 10m) and let our AI distill the core insights.</p>
              <button onClick={() => setStep(3)} className="w-full py-4 bg-white text-black font-bold rounded-2xl">Next</button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <BookOpen className="mx-auto text-orange-500" size={48} />
              <h2 className="text-2xl font-bold">Your Library</h2>
              <p className="text-zinc-400">Every brief is saved to your library with a neural voiceover. Listen on the go or read the distillation.</p>
              <button onClick={() => setStep(4)} className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl">Start Personalizing</button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="text-center">
                <h2 className="text-xl font-bold">Pick your Big 3</h2>
                <p className="text-sm text-zinc-400 mt-1">Select 3 podcasts to follow on your dashboard.</p>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input 
                  autoFocus
                  className="w-full bg-black border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Search podcasts..."
                  onChange={(e) => searchPodcasts(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {results.map((p: any) => (
                  <button 
                    key={p.id}
                    onClick={() => {
                      if (selected.find(s => s.id === p.id)) setSelected(selected.filter(s => s.id !== p.id));
                      else if (selected.length < 3) setSelected([...selected, p]);
                    }}
                    className={`flex items-center gap-3 p-2 rounded-xl transition-all ${selected.find(s => s.id === p.id) ? 'bg-orange-500/20 border border-orange-500' : 'hover:bg-white/5 border border-transparent'}`}
                  >
                    <img src={p.image} className="w-10 h-10 rounded-lg" />
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{p.name}</p>
                    </div>
                    {selected.find(s => s.id === p.id) && <Check size={14} className="text-orange-500" />}
                  </button>
                ))}
              </div>

              <button 
                disabled={selected.length < 3}
                onClick={finish}
                className="w-full py-4 bg-white text-black font-bold rounded-2xl disabled:opacity-20 transition-all"
              >
                {selected.length === 3 ? "Launch Studio" : `Pick ${3 - selected.length} more`}
              </button>
            </div>
          )}
        </div>
        
        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
