"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search, ArrowRight, Play, Layout, Sparkles,
  Crown, Speaker, Check, LogOut, CreditCard, Terminal, Lock, Settings, Bell, LifeBuoy,
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import LibraryView from "@/app/components/LibraryView";
import PodcastGrid from "@/app/components/PodcastGrid";
import BillingPage from "@/app/dashboard/billing/page";
import HelpPage from "@/app/dashboard/help/page";
import EpisodeVault from "@/app/components/EpisodeVault";
import type { Episode } from "@/app/api/episodes/route";
import type { ShowSelection } from "@/app/components/PodcastGrid";

type VoiceName = "Rachel" | "Sarah" | "Marcus" | "George";

const voices: {
  elevenLabsId: string;
  id: VoiceName;
  label: string;
  desc: string;
  initial: string;
  gradient: string;
  previewUrl: string;
}[] = [
  { elevenLabsId: "21m00Tcm4TlvDq8ikWAM", id: "Rachel",  label: "Rachel (Calm)",       desc: "Calm • Warm • Storytelling",  initial: "R", gradient: "from-rose-400 to-rose-700",    previewUrl: "/Rachel.mp3" },
  { elevenLabsId: "EXAVITQu4vr4xnSDxMaL", id: "Sarah",   label: "Sarah (Broadcast)",   desc: "US Female • Broadcast",       initial: "S", gradient: "from-pink-500 to-pink-700",   previewUrl: "/Sarah.mp3" },
  { elevenLabsId: "bIHbv24MWmeRgasZH58o", id: "Marcus",  label: "Marcus (Executive)",  desc: "US Male • Authoritative",    initial: "M", gradient: "from-blue-500 to-blue-700",   previewUrl: "/Marcus.mp3" },
  { elevenLabsId: "JBFqnCBsd6RMkjVDRZzb", id: "George",  label: "George (Cinematic)",  desc: "UK Male • Cinematic",         initial: "G", gradient: "from-green-500 to-green-700", previewUrl: "/George.mp3" },
];

type SearchResult = {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl600: string;
  feedUrl: string;
};

type Toast = { id: number; message: string; type: "error" | "info" };

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
  const [activeView, setActiveView] = useState<"new-summary" | "library" | "billing" | "help">("new-summary");
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>("Rachel");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("trialing");

  // Developer mode — unlocked for admin email
  const [devMode, setDevMode] = useState(false);
  const [bypassCredits, setBypassCredits] = useState(false);
  const [devLogs, setDevLogs] = useState<string[]>([]);

  // Summarize state
  const [urlInput, setUrlInput] = useState("");
  const [briefLength, setBriefLength] = useState<"3m" | "5m" | "10m">("5m");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [briefResult, setBriefResult] = useState<BriefResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Global audio player — persists across view changes
  const [globalAudio, setGlobalAudio] = useState<{ url: string; title: string } | null>(null);

  // Search results (when input is a text query, not a URL)
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Voice preview
  const [previewingVoice, setPreviewingVoice] = useState<VoiceName | null>(null);
  const voicePreviewRef = useRef<HTMLAudioElement | null>(null);

  // Pro gate — derived from live subscription data; devMode always acts as Pro
  const isPro = devMode || subscriptionStatus === "active" || subscriptionStatus === "pro";
  const trialExpired = !isPro && daysRemaining !== null && daysRemaining <= 0;
  const [showProModal, setShowProModal] = useState(false);

  // Credit tracking
  const [planTier, setPlanTier] = useState<"free" | "pro" | "max">("free");
  const [monthlyGenerations, setMonthlyGenerations] = useState(0);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Settings modal
  const [showSettings, setShowSettings] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [savingNotif, setSavingNotif] = useState(false);

  // Subscribed feeds — Set of feedUrls the user has Auto-Distill enabled
  const [subscribedFeeds, setSubscribedFeeds] = useState<Set<string>>(new Set());

  // Episode Vault
  const [vaultShow, setVaultShow] = useState<ShowSelection | null>(null);
  const [vaultEpisodes, setVaultEpisodes] = useState<Episode[]>([]);
  const [vaultLoading, setVaultLoading] = useState(false);

  // Onboarding: true once the DB trigger has created the profiles row
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    let pollTimer: ReturnType<typeof setTimeout> | null = null;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setUserEmail(user.email ?? null);
      if (user.email === "heydevon@gmail.com") setDevMode(true);

      // Poll profiles table for trial + subscription data
      let attempts = 0;
      const checkProfile = async () => {
        const { data } = await supabase
          .from("profiles")
          .select("id, trial_ends_at, subscription_status, plan_tier, monthly_generations, email_notifications")
          .eq("id", user.id)
          .maybeSingle();
        if (data) {
          setProfileReady(true);
          // Subscription status
          if (data.subscription_status) setSubscriptionStatus(data.subscription_status as string);
          // Credit tier
          if (data.plan_tier) setPlanTier(data.plan_tier as "free" | "pro" | "max");
          if (data.monthly_generations != null) setMonthlyGenerations(data.monthly_generations as number);
          // Notification pref
          if (data.email_notifications != null) setEmailNotifications(data.email_notifications as boolean);
          // Days remaining — prefer profiles row, fall back to user_metadata
          const trialEndsAt: string | undefined =
            data.trial_ends_at ?? (user.user_metadata?.trial_ends_at as string | undefined);
          if (trialEndsAt) {
            const diff = Math.ceil(
              (new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            setDaysRemaining(Math.max(0, diff));
          }
        } else if (attempts < 8) {
          attempts++;
          pollTimer = setTimeout(checkProfile, 1500);
        } else {
          setProfileReady(true);
        }
      };
      checkProfile();

      // Load existing subscriptions so toggle reflects correct state
      supabase
        .from("subscriptions")
        .select("feed_url")
        .eq("user_id", user.id)
        .then(({ data: subs }) => {
          if (subs) setSubscribedFeeds(new Set(subs.map((s: { feed_url: string }) => s.feed_url)));
        });
    });

    return () => { if (pollTimer) clearTimeout(pollTimer); };
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
  // Auto-play the audio brief as soon as it loads
  useEffect(() => {
    if (globalAudio?.url && audioRef.current) {
      audioRef.current.load();
      const el = audioRef.current;
      const onCanPlay = () => {
        el.play().then(() => setIsPlaying(true)).catch(() => {});
        el.removeEventListener("canplaythrough", onCanPlay);
      };
      el.addEventListener("canplaythrough", onCanPlay);
    }
  }, [globalAudio?.url]);
  const toastCounter = useRef(0);

  const showToast = (message: string, type: Toast["type"] = "error") => {
    const id = ++toastCounter.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  };

  const previewVoice = (voiceId: VoiceName, url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle off if already playing this voice
    if (previewingVoice === voiceId) {
      voicePreviewRef.current?.pause();
      voicePreviewRef.current = null;
      setPreviewingVoice(null);
      return;
    }
    // Stop any current preview
    if (voicePreviewRef.current) {
      voicePreviewRef.current.pause();
      voicePreviewRef.current = null;
    }
    const audio = new Audio(url);
    voicePreviewRef.current = audio;
    setPreviewingVoice(voiceId);
    audio.play().catch(() => {
      // Silent failure — file may not exist in dev
      voicePreviewRef.current = null;
      setPreviewingVoice(null);
    });
    audio.addEventListener("ended", () => {
      voicePreviewRef.current = null;
      setPreviewingVoice(null);
    });
  };

  const handleSearch = async () => {
    if (!urlInput.trim() || isSearching) return;
    setIsSearching(true);
    setSearchResults(null);
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(urlInput.trim())}&media=podcast&entity=podcast&limit=9`
      );
      const data = await res.json();
      const results: SearchResult[] = (data.results ?? []).filter((r: SearchResult) => r.feedUrl);
      if (results.length === 0) showToast("No podcasts found. Try a different search.", "info");
      setSearchResults(results);
    } catch {
      showToast("Search failed. Check your connection.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleShowSelect = async (show: ShowSelection) => {
    setVaultShow(show);
    setVaultEpisodes([]);
    if (!show.feedUrl) {
      showToast("No RSS feed found for this show.", "info");
      return;
    }
    setVaultLoading(true);
    try {
      const res = await fetch(`/api/episodes?feedUrl=${encodeURIComponent(show.feedUrl)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load episodes");
      setVaultEpisodes(data.episodes ?? []);
    } catch (err) {
      showToast((err as Error).message);
      setVaultShow(null);
    } finally {
      setVaultLoading(false);
    }
  };

  const handleEpisodeSelect = (audioUrl: string) => {
    setUrlInput(audioUrl);
    setVaultShow(null);
    setVaultEpisodes([]);
    setSearchResults(null);
  };

  const devLog = (msg: string) =>
    setDevLogs((l) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...l].slice(0, 100));

  const handleSubscribe = async (subscribed: boolean) => {
    if (!vaultShow?.feedUrl) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (subscribed) {
      const { error } = await supabase.from("subscriptions").upsert(
        { user_id: user.id, podcast_name: vaultShow.name, feed_url: vaultShow.feedUrl },
        { onConflict: "user_id,feed_url" }
      );
      if (error) throw error;
      setSubscribedFeeds(prev => new Set([...prev, vaultShow.feedUrl!]));
      showToast(`Auto-Distill enabled for ${vaultShow.name}`, "info");
    } else {
      const { error } = await supabase
        .from("subscriptions")
        .delete()
        .eq("user_id", user.id)
        .eq("feed_url", vaultShow.feedUrl);
      if (error) throw error;
      setSubscribedFeeds(prev => { const s = new Set(prev); s.delete(vaultShow.feedUrl!); return s; });
      showToast(`Unsubscribed from ${vaultShow.name}`, "info");
    }
  };

  const handleToggleEmailNotifications = async (enabled: boolean) => {
    setSavingNotif(true);
    setEmailNotifications(enabled);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("profiles").update({ email_notifications: enabled }).eq("id", user.id);
    } catch {
      setEmailNotifications(!enabled); // revert
      showToast("Failed to save notification preference.");
    } finally {
      setSavingNotif(false);
    }
  };

  const handlePlayLibraryBrief = (url: string, title: string) => {
    // Stop current playback then load new track
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setAudioProgress(0);
      setAudioDuration(0);
    }
    setGlobalAudio({ url, title });
  };

  const handleSummarize = async () => {
    if (!urlInput.trim() || isSummarizing) return;
    setIsSummarizing(true);
    setBriefResult(null);
    setStageIndex(0);
    if (devMode) devLog("→ POST /api/summarize — url: " + urlInput.trim());

    const stageTimer = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, LOADING_STAGES.length - 1));
    }, 4000);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: urlInput.trim(),
          length: briefLength,
          bypassCredits,
          voiceId: voices.find(v => v.id === selectedVoice)?.elevenLabsId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (devMode) devLog(`✗ Error ${res.status}: ${data.error}`);
        if (data.upgradeRequired) setShowProModal(true);
        throw new Error(data.error ?? "Summarization failed");
      }
      if (devMode) {
        devLog(`✓ AssemblyAI — transcript ${data.transcriptLength} chars`);
        devLog(`✓ GPT-4o-mini — brief generated`);
        devLog(data.briefAudioUrl ? `✓ ElevenLabs — audio ready` : `⚠ ElevenLabs — no audio (non-fatal)`);
        devLog(`✓ DB — record id: ${data.id}`);
      }
      setBriefResult(data as BriefResult);
      // Load audio into global player
      if (data.briefAudioUrl) {
        setGlobalAudio({ url: data.briefAudioUrl, title: "Audia Brief" });
      }
      // Optimistically increment local credit counter
      setMonthlyGenerations(prev => prev + 1);
    } catch (err) {
      showToast((err as Error).message);
    } finally {
      clearInterval(stageTimer);
      setIsSummarizing(false);
      setStageIndex(0);
    }
  };

  // Onboarding gate — show deep-glass overlay until profiles row is confirmed
  if (!profileReady) {
    return (
      <main className="min-h-screen bg-black text-white font-sans antialiased flex items-center justify-center">
        <div className="fixed top-[-15%] left-[-10%] w-[50vw] h-[50vw] bg-[#FF6600]/15 rounded-full blur-[150px] pointer-events-none" />
        <div className="fixed bottom-[-20%] right-[-15%] w-[45vw] h-[45vw] bg-[#FF6600]/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center">
            <svg className="animate-spin w-7 h-7 text-[#FF6600]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#FF6600]/80 mb-1">Audia</p>
            <p className="text-sm font-semibold text-white">Finalizing your signal…</p>
            <p className="text-xs text-zinc-500 mt-1">Setting up your profile, just a moment.</p>
          </div>
        </div>
      </main>
    );
  }

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
            <button
              onClick={() => setActiveView("billing")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeView === "billing"
                  ? "bg-gradient-to-r from-orange-500/20 to-transparent border border-orange-500/30 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <CreditCard size={14} className={activeView === "billing" ? "text-orange-400" : ""} />
              Billing
            </button>
            <button
              onClick={() => setActiveView("help")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeView === "help"
                  ? "bg-gradient-to-r from-orange-500/20 to-transparent border border-orange-500/30 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <LifeBuoy size={14} className={activeView === "help" ? "text-orange-400" : ""} />
              Help &amp; Support
            </button>
          </nav>

          {/* Trial / status badge */}
          {!isPro && daysRemaining !== null && (
            <div className={`mb-3 px-3 py-2 rounded-xl border ${
              daysRemaining <= 2
                ? "bg-orange-500/15 border-orange-500/40"
                : "bg-white/[0.03] border-white/10"
            }`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                {daysRemaining <= 2 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shrink-0" />
                )}
                <p className={`text-[10px] font-bold uppercase tracking-widest ${
                  daysRemaining <= 2 ? "text-orange-400" : "text-zinc-500"
                }`}>Trial</p>
              </div>
              <p className={`text-xs font-semibold ${
                daysRemaining <= 2 ? "text-orange-300" : "text-white"
              }`}>
                {daysRemaining === 0 ? "Expired" : `${daysRemaining} Day${daysRemaining === 1 ? "" : "s"} Left`}
              </p>
            </div>
          )}

          {/* Credit counter */}
          {(() => {
            const caps: Record<string, number> = { free: 3, pro: 15, max: 100 };
            const cap = caps[planTier] ?? 3;
            const pct = Math.min((monthlyGenerations / cap) * 100, 100);
            const isMax = planTier === "max";
            const nearLimit = !isMax && pct >= 75;
            const atLimit = !isMax && monthlyGenerations >= cap;
            return (
              <div className="mb-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Credits</span>
                  <span className={`text-[10px] font-semibold tabular-nums ${
                    isMax ? "text-emerald-400" : atLimit ? "text-red-400" : nearLimit ? "text-orange-400" : "text-zinc-300"
                  }`}>
                    {isMax ? "∞" : `${monthlyGenerations}/${cap}`}
                  </span>
                </div>
                {isMax ? (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <p className="text-[9px] text-emerald-500/80 uppercase tracking-widest font-semibold">Signal Active</p>
                  </div>
                ) : (
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        atLimit ? "bg-red-500" : nearLimit ? "bg-orange-400" : "bg-emerald-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
                <p className="text-[9px] text-zinc-600 mt-1.5 capitalize">{planTier} Plan</p>
              </div>
            );
          })()}

          {/* Upgrade card */}
          <div className="p-3 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-orange-500/20 rounded-xl">
            <div className="flex items-center gap-1.5 mb-2">
              <Crown size={12} className="text-orange-400" />
              <span className="text-xs font-bold tracking-widest uppercase text-white">Pro Plan</span>
            </div>
            <button
              onClick={() => setShowProModal(true)}
              className="w-full py-1.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-[10px] text-orange-300 font-semibold transition-all"
            >
              Upgrade
            </button>
          </div>

          {/* User / sign out */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-[10px] text-zinc-500 truncate mb-3">{userEmail ?? "—"}</p>
            <div className="flex items-center gap-1">
              <button
                onClick={handleSignOut}
                className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all text-xs font-medium"
              >
                <LogOut size={13} />
                Sign Out
              </button>
              <button
                onClick={() => setShowSettings(true)}
                title="Settings"
                className="p-2 rounded-xl text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-all"
              >
                <Settings size={13} />
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main content column ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Global Audio Player ── always visible when audio is loaded, persists across views */}
        {globalAudio && (
          <>
            <audio
              ref={audioRef}
              src={globalAudio.url}
              onTimeUpdate={(e) => setAudioProgress(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
              onEnded={() => setIsPlaying(false)}
            />
            <div className={`shrink-0 mx-6 mt-4 mb-0 relative bg-black/50 backdrop-blur-2xl border rounded-2xl px-5 py-3.5 transition-all duration-500 ${
              isPlaying
                ? "border-orange-500/40 shadow-[0_0_30px_rgba(255,102,0,0.18)]"
                : "border-white/10"
            }`}>
              {isPlaying && (
                <div className="absolute inset-0 rounded-2xl bg-orange-500/[0.04] animate-pulse pointer-events-none" />
              )}
              <div className="relative z-10 flex items-center gap-4">
                {/* Play/Pause */}
                <button
                  onClick={toggleAudio}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isPlaying
                      ? "bg-orange-500 shadow-[0_0_18px_rgba(255,102,0,0.5)] scale-105"
                      : "bg-white/10 border border-white/20 hover:bg-white/20"
                  }`}
                >
                  {isPlaying ? (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
                      <rect x="3" y="2" width="4" height="12" rx="1"/>
                      <rect x="9" y="2" width="4" height="12" rx="1"/>
                    </svg>
                  ) : (
                    <Play size={14} fill="white" className="text-white ml-0.5" />
                  )}
                </button>

                {/* Track label + progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate">{globalAudio.title}</span>
                    <span className={`text-[10px] font-mono shrink-0 ml-3 ${
                      isPlaying ? "text-orange-500/80" : "text-zinc-500"
                    }`}>
                      {isPlaying ? "Playing…" : audioDuration ? formatTime(audioDuration) : "--:--"}
                    </span>
                  </div>
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
                      style={{ width: audioDuration ? `${(audioProgress / audioDuration) * 100}%` : "0%" }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] font-mono text-zinc-600">{formatTime(audioProgress)}</span>
                    <span className="text-[9px] font-mono text-zinc-600">{audioDuration ? formatTime(audioDuration) : "--:--"}</span>
                  </div>
                </div>

                {/* Dismiss */}
                <button
                  onClick={() => { audioRef.current?.pause(); setIsPlaying(false); setGlobalAudio(null); setAudioProgress(0); setAudioDuration(0); }}
                  className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-all shrink-0"
                  title="Close player"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1l8 8M9 1L1 9"/></svg>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── View content ── */}
        {activeView === "new-summary" ? (
          <div className="flex-1 flex flex-col overflow-hidden">
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

              {/* URL input + controls — wrapped in paywall when trial expired */}
              <div className="px-8 pt-6 relative">
                {/* ── Paywall overlay ── */}
                {trialExpired && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md rounded-2xl" />
                    <div className="relative z-10 flex flex-col items-center text-center max-w-sm px-6">
                      <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mb-5">
                        <Crown size={26} className="text-orange-400" />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500 mb-2">Signal Complete</p>
                      <h2 className="text-xl font-black tracking-tighter text-white mb-3 leading-tight">
                        Your 7-Day Signal is complete.
                      </h2>
                      <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                        Upgrade to Pro to reactivate your intelligence engine and process unlimited episodes.
                      </p>
                      <button
                        onClick={() => setShowProModal(true)}
                        className="w-full py-3 px-6 bg-gradient-to-r from-[#FF7A00] to-[#E05A00] rounded-xl font-bold text-white text-sm shadow-[0_0_30px_rgba(255,120,0,0.35)] hover:scale-[1.02] transition-all"
                      >
                        Upgrade Now — $9.99/mo
                      </button>
                    </div>
                  </div>
                )}
                {(() => {
                  const trimmed = urlInput.trim();
                  const isUrl = trimmed !== "" && /^https?:\/\//i.test(trimmed);
                  const isSearchMode = trimmed !== "" && !isUrl;
                  const handleAction = () => isSearchMode ? handleSearch() : handleSummarize();
                  const isWorking = isSummarizing || isSearching || trialExpired;
                  return (
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => { setUrlInput(e.target.value); setSearchResults(null); }}
                      onKeyDown={(e) => e.key === "Enter" && handleAction()}
                      placeholder="Paste a URL, RSS feed, or search for a podcast…"
                      disabled={isWorking}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all disabled:opacity-50"
                    />
                  </div>
                  <button
                    onClick={handleAction}
                    disabled={isWorking || !urlInput.trim()}
                    className="px-5 py-3 bg-gradient-to-r from-[#FF7A00] to-[#E05A00] rounded-xl text-white font-bold text-sm flex items-center gap-2 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,120,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-w-[150px] justify-center"
                  >
                    {isWorking ? (
                      <>
                        <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                        </svg>
                        <span className="font-mono text-xs tracking-widest uppercase truncate">
                          {isSummarizing ? LOADING_STAGES[stageIndex] : "Searching…"}
                        </span>
                      </>
                    ) : isSearchMode ? (
                      <><Search size={14} /> SEARCH SHOWS</>
                    ) : (
                      <>SUMMARIZE <ArrowRight size={14} /></>
                    )}
                  </button>
                </div>
                  );
                })()}

                {/* Controls row */}
                <div className="flex items-center gap-5 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Length:</span>
                    <div className="bg-black/60 border border-white/10 rounded-full p-0.5 flex items-center">
                      {(["3m", "5m", "10m"] as const).map((l) => {
                        const locked = l === "10m" && !isPro;
                        return (
                          <button
                            key={l}
                            onClick={() => locked ? setShowProModal(true) : setBriefLength(l)}
                            title={locked ? "Requires Pro Plan" : undefined}
                            className={`px-3 py-1 rounded-full text-[10px] transition-all flex items-center gap-1 ${
                              locked
                                ? "text-zinc-600 cursor-pointer"
                                : l === briefLength
                                  ? "bg-[#FF6600]/20 border border-[#FF6600]/50 text-[#FF8A00]"
                                  : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            {l}{locked && <Lock size={8} className="text-zinc-600" />}
                          </button>
                        );
                      })}
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
                          <div key={v.id} className="flex items-center gap-1">
                            <button
                              onClick={() => { setSelectedVoice(v.id); setVoiceOpen(false); }}
                              className="flex-1 flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#FF6600]/10 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 bg-gradient-to-br ${v.gradient} rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0`}>{v.initial}</div>
                                <div className="text-left">
                                  <p className="text-xs text-white font-medium">{v.label}</p>
                                  <p className="text-[10px] text-zinc-500">{v.desc}</p>
                                </div>
                              </div>
                              {selectedVoice === v.id && <Check size={13} className="text-[#FF6600] shrink-0" />}
                            </button>

                            {/* Preview button */}
                            <button
                              onClick={(e) => previewVoice(v.id, v.previewUrl, e)}
                              title={previewingVoice === v.id ? "Stop preview" : "Preview voice"}
                              className={`relative p-1.5 rounded-lg transition-all shrink-0 ${
                                previewingVoice === v.id
                                  ? "text-orange-400"
                                  : "text-white/30 hover:text-orange-500"
                              }`}
                            >
                              {/* Pulse ring while playing */}
                              {previewingVoice === v.id && (
                                <span className="absolute inset-0 rounded-lg ring-1 ring-orange-500/60 animate-pulse" />
                              )}
                              {previewingVoice === v.id
                                ? <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><rect width="10" height="10" rx="1.5"/></svg>
                                : <Play size={10} />}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>



                {/* Results: Deep Signal Brief + Audio Player */}
                {briefResult ? (
                  <div className={`space-y-3 transition-all duration-700 ${briefResult ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Deep Signal Brief</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{(briefResult.transcriptLength / 5 / 60).toFixed(0)} min transcript</span>
                    </div>

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
                    <div className="grid grid-cols-4 gap-3 mb-6">
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
                    {/* Search results grid */}
                    {searchResults !== null && (
                      <div className="mb-4">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                          {searchResults.length > 0 ? `${searchResults.length} Results` : "No results"}
                        </p>
                        {searchResults.length > 0 && (
                          <div className="grid grid-cols-3 gap-3">
                            {searchResults.map((r) => (
                              <button
                                key={r.trackId}
                                onClick={() => { setUrlInput(r.feedUrl); setSearchResults(null); }}
                                className="group flex items-center gap-3 p-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-orange-500/30 rounded-xl transition-all text-left"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={r.artworkUrl600} alt={r.trackName} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-white truncate">{r.trackName}</p>
                                  <p className="text-[10px] text-zinc-500 truncate">{r.artistName}</p>
                                </div>
                                <ArrowRight size={11} className="text-zinc-600 group-hover:text-orange-400 shrink-0 ml-auto transition-colors" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <PodcastGrid
                      onSelect={(name) => setUrlInput(name)}
                      onSelectShow={handleShowSelect}
                    />
                  </>
                )}
              </div>

          </div>
          ) : activeView === "library" ? (
            <div className="flex-1 overflow-auto p-8">
              <LibraryView onPlay={handlePlayLibraryBrief} />
            </div>
          ) : activeView === "help" ? (
            <HelpPage />
          ) : (
            <BillingPage />
          )}
        </div>

      </div>

      {/* ── Episode Vault ── */}
      {vaultShow && (
        <EpisodeVault
          showName={vaultShow!.name}
          artworkUrl={vaultShow!.artwork}
          feedUrl={vaultShow!.feedUrl}
          episodes={vaultEpisodes}
          loading={vaultLoading}
          onSelect={handleEpisodeSelect}
          onSubscribe={handleSubscribe}
          initialSubscribed={vaultShow!.feedUrl ? subscribedFeeds.has(vaultShow!.feedUrl as string) : false}
          onClose={() => { setVaultShow(null); setVaultEpisodes([]); }}
        />
      )}

      {/* ── Settings Modal ── */}
      {showSettings && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="relative bg-black/90 border border-white/10 rounded-2xl p-7 max-w-sm w-full mx-4 shadow-[0_0_80px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Deep-glass gradient */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                    <Settings size={14} className="text-zinc-300" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Preferences</p>
                    <h2 className="text-sm font-black tracking-tighter text-white leading-none">Settings</h2>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-all"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 1l10 10M11 1L1 11"/>
                  </svg>
                </button>
              </div>

              {/* Notification preference */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">
                      <Bell size={13} className={emailNotifications ? "text-orange-400" : "text-zinc-600"} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white mb-0.5">Delivery Method</p>
                      <p className="text-[11px] text-zinc-500 leading-snug">
                        {emailNotifications
                          ? "Email me the audio brief when new episodes are distilled."
                          : "Dashboard only — no emails will be sent."}
                      </p>
                    </div>
                  </div>
                  {/* Toggle */}
                  <button
                    onClick={() => !savingNotif && handleToggleEmailNotifications(!emailNotifications)}
                    disabled={savingNotif}
                    className={`relative w-10 h-5 rounded-full shrink-0 transition-colors duration-200 ${
                      emailNotifications ? "bg-orange-500" : "bg-zinc-700"
                    } disabled:opacity-50`}
                    aria-label="Toggle email notifications"
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                      emailNotifications ? "translate-x-5" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>
                {/* Label below toggle */}
                <div className="mt-3 flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${emailNotifications ? "bg-orange-400 animate-pulse" : "bg-zinc-700"}`} />
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    {savingNotif ? "Saving…" : emailNotifications ? "Email Briefs On" : "Dashboard Only"}
                  </p>
                </div>
              </div>

              {/* Subscriptions count */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white mb-0.5">Auto-Distill Feeds</p>
                    <p className="text-[11px] text-zinc-500">Shows set to auto-summarize new episodes.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-white tabular-nums">{subscribedFeeds.size}</p>
                    <p className="text-[9px] text-zinc-600 uppercase tracking-widest">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Pro Gate Modal ── */}
      {showProModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowProModal(false)}
        >
          <div
            className="relative bg-black/90 border border-orange-500/30 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-[0_0_80px_rgba(255,102,0,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                <Crown size={22} className="text-orange-400" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500 mb-1">Pro Plan Required</p>
              <h2 className="text-xl font-black tracking-tighter text-white mb-2">Extended Intelligence</h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                10-minute deep-dive summaries are a Pro feature. Unlock unlimited length, priority processing, and advanced voice options.
              </p>
              <div className="flex items-end gap-1.5 mb-6">
                <span className="text-4xl font-black text-white">$9.99</span>
                <span className="text-sm text-zinc-500 pb-1.5">/month</span>
              </div>
              <button
                onClick={() => window.open("https://buy.stripe.com/placeholder", "_blank")}
                className="w-full py-3 bg-gradient-to-r from-[#FF7A00] to-[#E05A00] rounded-xl font-bold text-white text-sm shadow-[0_0_20px_rgba(255,120,0,0.3)] hover:scale-[1.02] transition-all mb-2"
              >
                Upgrade to Pro
              </button>
              <button
                onClick={() => setShowProModal(false)}
                className="w-full py-2 text-zinc-600 hover:text-zinc-400 text-xs transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notifications ── */}
      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 bg-black/95 backdrop-blur-xl rounded-xl shadow-2xl text-xs font-medium max-w-xs border ${
              t.type === "error"
                ? "border-red-500/40 text-red-400"
                : "border-white/10 text-zinc-300"
            }`}
          >
            <span className="shrink-0 mt-0.5">{t.type === "error" ? "⚠" : "ℹ"}</span>
            <span className="leading-snug">{t.message}</span>
          </div>
        ))}
      </div>

      {/* ── Developer Mode Panel ── */}
      {devMode && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-orange-500/30">
          <div className="max-w-full px-6 py-2 flex items-center gap-4">
            <div className="flex items-center gap-1.5 shrink-0">
              <Terminal size={13} className="text-orange-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Dev Mode</span>
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
              <div
                onClick={() => setBypassCredits(b => !b)}
                className={`w-8 h-4 rounded-full transition-colors relative ${
                  bypassCredits ? "bg-orange-500" : "bg-zinc-700"
                }`}
              >
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                  bypassCredits ? "translate-x-4" : "translate-x-0.5"
                }`} />
              </div>
              <span className="text-[10px] text-zinc-400">Bypass Credits</span>
            </label>
            <div className="flex-1 overflow-x-auto">
              <div className="flex gap-3 font-mono text-[10px]">
                {devLogs.length === 0 ? (
                  <span className="text-zinc-600">No logs yet — run a summary to see API calls here.</span>
                ) : (
                  devLogs.slice(0, 5).map((log, i) => (
                    <span key={i} className={`whitespace-nowrap ${
                      log.includes("✓") ? "text-emerald-400" : log.includes("✗") ? "text-red-400" : log.includes("⚠") ? "text-yellow-400" : "text-zinc-400"
                    }`}>{log}</span>
                  ))
                )}
              </div>
            </div>
            <button
              onClick={() => setDevLogs([])}
              className="text-[10px] text-zinc-600 hover:text-zinc-400 shrink-0"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
