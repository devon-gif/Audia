"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search, ArrowRight, Play, FileText, Layout, Star, Sparkles,
  Crown, SkipBack, SkipForward, Speaker, Check, LogOut,
} from "lucide-react";
import Image from "next/image";
import { supabase } from "@/utils/supabase/client";
import LibraryView from "@/app/components/LibraryView";

type VoiceName = "Marcus" | "Sarah" | "George" | "Charlotte";

const voices: { id: VoiceName; label: string; desc: string; initial: string; gradient: string }[] = [
  { id: "Marcus",    label: "Marcus (US)",    desc: "US Male • Authoritative",    initial: "M", gradient: "from-blue-500 to-blue-700" },
  { id: "Sarah",     label: "Sarah (US)",     desc: "US Female • Conversational", initial: "S", gradient: "from-pink-500 to-pink-700" },
  { id: "George",    label: "George (UK)",    desc: "UK Male • Analytical",       initial: "G", gradient: "from-green-500 to-green-700" },
  { id: "Charlotte", label: "Charlotte (UK)", desc: "UK Female • Sophisticated",  initial: "C", gradient: "from-purple-500 to-purple-700" },
];

const LOADING_STAGES = [
  "Fetching feed…",
  "Submitting to transcription engine…",
  "Analyzing waveforms…",
  "Neural distillation in progress…",
  "Composing Deep Signal brief…",
  "Persisting to library…",
];

type BriefResult = {
  id: string | null;
  brief: string;
  audioUrl: string;
  briefAudioUrl: string | null;
  transcriptLength: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<"new-summary" | "library">("new-summary");
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>("Marcus");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  // Summarize state
  const [urlInput, setUrlInput] = useState("");
  const [briefLength, setBriefLength] = useState<"3m" | "5m" | "10m">("5m");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [briefResult, setBriefResult] = useState<BriefResult | null>(null);
  const [summarizeError, setSummarizeError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setUserEmail(user.email ?? null);
      const trialEndsAt = user.user_metadata?.trial_ends_at as string | undefined;
      if (trialEndsAt) {
        const diff = Math.ceil(
          (new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        setDaysRemaining(Math.max(0, diff));
      }
    });
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const toggleAudio = () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) { el.pause(); setIsPlaying(false); }
    else { el.play(); setIsPlaying(true); }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  const handleSummarize = async () => {
    if (!urlInput.trim() || isSummarizing) return;
    setIsSummarizing(true);
    setSummarizeError(null);
    setBriefResult(null);
    setStageIndex(0);

    // Cycle through loading stage labels while the request is in flight
    const stageTimer = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, LOADING_STAGES.length - 1));
    }, 4000);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim(), length: briefLength }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Summarization failed");
      setBriefResult(data as BriefResult);
    } catch (err) {
      setSummarizeError((err as Error).message);
    } finally {
      clearInterval(stageTimer);
      setIsSummarizing(false);
      setStageIndex(0);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans antialiased flex flex-col overflow-hidden">
      {/* Ambient glows */}
      <div className="fixed top-[-15%] left-[-10%] w-[50vw] h-[50vw] bg-[#FF6600]/15 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-15%] w-[45vw] h-[45vw] bg-[#FF6600]/10 rounded-full blur-[150px] pointer-events-none z-0" />

      <div className="relative z-10 flex flex-1 overflow-hidden h-screen">
        {/* ── Sidebar ── */}
        <aside className="w-[220px] bg-black/60 backdrop-blur-2xl border-r border-white/5 p-6 flex flex-col shrink-0">
          {/* Logo */}
          <div className="text-xl font-black tracking-tighter text-white mb-8">
            Audia<span className="text-[#FF6600]">.</span>
          </div>

          {/* Nav */}
          <nav className="space-y-1 flex-1">
            <button
              onClick={() => setActiveView("new-summary")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeView === "new-summary"
                  ? "bg-gradient-to-r from-orange-500/20 to-transparent border border-orange-500/30 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sparkles size={14} className={activeView === "new-summary" ? "text-orange-400" : ""} />
              New Summary
            </button>
            <button
              onClick={() => setActiveView("library")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeView === "library"
                  ? "bg-gradient-to-r from-orange-500/20 to-transparent border border-orange-500/30 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Layout size={14} className={activeView === "library" ? "text-orange-400" : ""} />
              Library
            </button>
            <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl text-xs transition-all">
              <Star size={14} />
              Highlights
            </button>
            <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl text-xs transition-all">
              <FileText size={14} />
              Templates
            </button>
          </nav>

          {/* Trial badge */}
          {daysRemaining !== null && (
            <div className="mb-3 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400">
                Trial
              </p>
              <p className="text-xs text-white font-semibold">{daysRemaining} Days Remaining</p>
            </div>
          )}

          {/* Upgrade card */}
          <div className="p-3 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-orange-500/20 rounded-xl">
            <div className="flex items-center gap-1.5 mb-2">
              <Crown size={12} className="text-orange-400" />
              <span className="text-xs font-bold tracking-widest uppercase text-white">Pro Plan</span>
            </div>
            <button className="w-full py-1.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-[10px] text-orange-300 font-semibold transition-all">
              Upgrade
            </button>
          </div>

          {/* User / sign out */}
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-[10px] text-zinc-500 truncate max-w-[130px]">{userEmail ?? "—"}</p>
            <button onClick={handleSignOut} className="text-zinc-500 hover:text-white transition-colors" title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeView === "new-summary" ? (
            <>
              {/* Top bar */}
              <div className="flex items-center justify-between px-8 py-5 border-b border-white/5">
                <div>
                  <h1 className="text-lg font-black tracking-tighter text-white">New Summary</h1>
                  <p className="text-xs text-zinc-500 mt-0.5">Paste a podcast URL to generate your brief</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Engine Online
                </div>
              </div>

              {/* URL input + controls */}
              <div className="px-8 pt-6">
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSummarize()}
                      placeholder="Paste podcast URL or RSS feed…"
                      disabled={isSummarizing}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all disabled:opacity-50"
                    />
                  </div>
                  <button
                    onClick={handleSummarize}
                    disabled={isSummarizing || !urlInput.trim()}
                    className="px-5 py-3 bg-gradient-to-r from-[#FF7A00] to-[#E05A00] rounded-xl text-white font-bold text-sm flex items-center gap-2 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,120,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-w-[150px] justify-center"
                  >
                    {isSummarizing ? (
                      <>
                        <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                        </svg>
                        <span className="font-mono text-xs tracking-widest uppercase truncate">{LOADING_STAGES[stageIndex]}</span>
                      </>
                    ) : (
                      <>SUMMARIZE <ArrowRight size={14} /></>
                    )}
                  </button>
                </div>

                {/* Controls row */}
                <div className="flex items-center gap-5 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Length:</span>
                    <div className="bg-black/60 border border-white/10 rounded-full p-0.5 flex items-center">
                      {(["3m", "5m", "10m"] as const).map((l) => (
                        <button
                          key={l}
                          onClick={() => setBriefLength(l)}
                          className={`px-3 py-1 rounded-full text-[10px] transition-all ${l === briefLength ? "bg-[#FF6600]/20 border border-[#FF6600]/50 text-[#FF8A00]" : "text-zinc-400 hover:text-white"}`}
                        >{l}</button>
                      ))}
                    </div>
                  </div>

                  {/* Voice selector */}
                  <div className="relative">
                    <button
                      onClick={() => setVoiceOpen(o => !o)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-full text-zinc-300 transition-all"
                    >
                      <Speaker size={13} />
                      <span className="text-[10px]">Voice: {voices.find(v => v.id === selectedVoice)?.label}</span>
                      <ArrowRight size={11} className={`transition-transform ${voiceOpen ? "-rotate-90" : "rotate-90"}`} />
                    </button>
                    {voiceOpen && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 z-50 shadow-2xl">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 px-2 font-bold">Select Voice</p>
                        {voices.map(v => (
                          <button
                            key={v.id}
                            onClick={() => { setSelectedVoice(v.id); setVoiceOpen(false); }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#FF6600]/10 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 bg-gradient-to-br ${v.gradient} rounded-full flex items-center justify-center text-[10px] font-black text-white`}>{v.initial}</div>
                              <div className="text-left">
                                <p className="text-xs text-white font-medium">{v.id}</p>
                                <p className="text-[10px] text-zinc-500">{v.desc}</p>
                              </div>
                            </div>
                            {selectedVoice === v.id && <Check size={13} className="text-[#FF6600]" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Error state */}
                {summarizeError && (
                  <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-mono">
                    ⚠ {summarizeError}
                  </div>
                )}

                {/* Results: Deep Signal Brief + Audio Player */}
                {briefResult ? (
                  <div className={`space-y-3 transition-all duration-700 ${briefResult ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Deep Signal Brief</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{(briefResult.transcriptLength / 5 / 60).toFixed(0)} min transcript</span>
                    </div>

                    {/* Deep-glass audio player — only shown when TTS audio exists */}
                    {briefResult.briefAudioUrl && (
                      <>
                        <audio
                          ref={audioRef}
                          src={briefResult.briefAudioUrl}
                          onTimeUpdate={(e) => setAudioProgress(e.currentTarget.currentTime)}
                          onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
                          onEnded={() => setIsPlaying(false)}
                        />
                        <div className={`relative bg-black/50 backdrop-blur-2xl border rounded-2xl p-5 transition-all duration-500 ${
                          isPlaying
                            ? 'border-orange-500/40 shadow-[0_0_40px_rgba(255,102,0,0.2)]'
                            : 'border-white/10'
                        }`}>
                          {/* Pulsing ambient glow while playing */}
                          {isPlaying && (
                            <div className="absolute inset-0 rounded-2xl bg-orange-500/5 animate-pulse pointer-events-none" />
                          )}
                          <div className="relative z-10 flex items-center gap-4">
                            {/* Play/Pause button */}
                            <button
                              onClick={toggleAudio}
                              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                                isPlaying
                                  ? 'bg-orange-500 shadow-[0_0_20px_rgba(255,102,0,0.5)] scale-105'
                                  : 'bg-white/10 border border-white/20 hover:bg-white/20'
                              }`}
                            >
                              {isPlaying ? (
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                                  <rect x="3" y="2" width="4" height="12" rx="1"/>
                                  <rect x="9" y="2" width="4" height="12" rx="1"/>
                                </svg>
                              ) : (
                                <Play size={16} fill="white" className="text-white ml-0.5" />
                              )}
                            </button>

                            {/* Waveform progress */}
                            <div className="flex-1">
                              <div
                                className="h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer"
                                onClick={(e) => {
                                  if (!audioRef.current || !audioDuration) return;
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * audioDuration;
                                }}
                              >
                                <div
                                  className="h-full bg-gradient-to-r from-[#FF7A00] to-[#FF4400] rounded-full transition-all duration-100"
                                  style={{ width: audioDuration ? `${(audioProgress / audioDuration) * 100}%` : '0%' }}
                                />
                              </div>
                              <div className="flex justify-between mt-1.5">
                                <span className="text-[10px] font-mono text-zinc-500">{formatTime(audioProgress)}</span>
                                <span className="text-[10px] font-mono text-orange-500/80 uppercase tracking-widest">
                                  {isPlaying ? 'Playing Brief…' : 'Audia Brief'}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-500">{audioDuration ? formatTime(audioDuration) : '--:--'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Brief text card */}
                    <div className={`bg-white/[0.02] border rounded-xl p-5 max-h-[280px] overflow-y-auto transition-all duration-500 ${
                      briefResult.briefAudioUrl && isPlaying
                        ? 'border-orange-500/20 shadow-[0_0_30px_rgba(255,102,0,0.08)]'
                        : 'border-white/5'
                    }`}>
                      <pre className="text-[12px] text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">{briefResult.brief}</pre>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Placeholder bento grid */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Summary Brief</span>
                      <span className="text-[10px] text-zinc-500">1:42:18</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                        <h4 className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-2">Key Takeaways</h4>
                        <ul className="space-y-1.5">
                          {["Deep work is a superpower", "Schedule focus time", "Avoid shallow work"].map(t => (
                            <li key={t} className="text-[11px] text-zinc-400">{t}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                        <h4 className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-2">Chapters</h4>
                        {[["00:00", "Distraction Crisis"], ["12:45", "Deep Work Is"], ["28:10", "Flow Protocols"]].map(([t, l]) => (
                          <div key={t} className="flex gap-2 text-[11px] mb-1">
                            <span className="text-zinc-500">{t}</span>
                            <span className="text-zinc-300">{l}</span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                        <h4 className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-2">Quote</h4>
                        <blockquote className="text-[11px] text-zinc-300 italic leading-relaxed">
                          &quot;You can do anything, but not everything.&quot;
                        </blockquote>
                        <p className="text-[10px] text-zinc-500 mt-2">— Cal Newport</p>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                        <h4 className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-2">Actions</h4>
                        {["Audit distractions", "Block deep work time", "Remove notifications"].map(a => (
                          <label key={a} className="flex items-start gap-1.5 mb-1.5">
                            <div className="w-3 h-3 border border-zinc-600 rounded mt-0.5 shrink-0" />
                            <span className="text-[11px] text-zinc-400">{a}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Audio player bar */}
              <div className="mt-auto bg-black/40 backdrop-blur-xl border-t border-white/5 px-8 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-[7px] text-zinc-400 font-bold tracking-widest uppercase">FOCUS</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-zinc-400 hover:text-white transition-colors"><SkipBack size={15} /></button>
                    <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-all">
                      <Play size={13} fill="black" className="text-black ml-0.5" />
                    </button>
                    <button className="text-zinc-400 hover:text-white transition-colors"><SkipForward size={15} /></button>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 tracking-widest">1.25×</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-auto p-8">
              <LibraryView />
            </div>
          )}
        </div>

        {/* Headphones decoration */}
        <div className="absolute bottom-0 right-0 w-48 h-48 pointer-events-none z-10 opacity-80">
          <Image src="/headphones.png" alt="" width={192} height={192} className="w-full h-full object-contain drop-shadow-2xl" priority />
        </div>
      </div>
    </main>
  );
}
