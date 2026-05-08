"use client";

import { useEffect, useRef, useState } from "react";
import { X, Radio, ArrowRight, Loader2, Bell, BellOff, HelpCircle, Check } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import * as Tooltip from "@radix-ui/react-tooltip";
import { type Episode } from "@/app/api/episodes/route";

interface Props {
  showName: string;
  artworkUrl?: string | null;
  feedUrl?: string | null;
  episodes: Episode[];
  loading: boolean;
  onSelect: (audioUrl: string) => void;
  onSubscribe?: (subscribed: boolean, preferredLength: string) => void;
  initialSubscribed?: boolean;
  initialPreferredLength?: string;
  onClose: () => void;
  onToast?: (message: string, type: "success" | "error" | "info") => void;
}

function formatDate(raw: string) {
  if (!raw) return "";
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(raw));
  } catch {
    return raw;
  }
}

export default function EpisodeVault({ 
  showName, 
  artworkUrl, 
  feedUrl, 
  episodes, 
  loading, 
  onSelect, 
  onSubscribe, 
  initialSubscribed = false,
  initialPreferredLength = "5m",
  onClose,
  onToast
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [subscribing, setSubscribing] = useState(false);
  const [preferredLength, setPreferredLength] = useState(initialPreferredLength);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleSubscribe = async () => {
    if (subscribing) return;
    setSubscribing(true);
    
    try {
      // Make API call to subscribe
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedUrl,
          podcastName: showName,
          preferredLength,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to subscribe");
      }

      const data = await response.json();
      
      if (data.success) {
        setSubscribed(true);
        setPopoverOpen(false);
        onToast?.("Subscribed. We will notify you when the next episode drops.", "success");
        await onSubscribe?.(true, preferredLength);
      } else {
        throw new Error(data.error || "Failed to subscribe");
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      onToast?.("Failed to subscribe. Please try again.", "error");
    } finally {
      setSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (subscribing) return;
    setSubscribing(true);
    
    try {
      const response = await fetch("/api/subscriptions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to unsubscribe");
      }

      const data = await response.json();
      
      if (data.success) {
        setSubscribed(false);
        onToast?.("Unsubscribed successfully", "info");
        await onSubscribe?.(false, preferredLength);
      } else {
        throw new Error(data.error || "Failed to unsubscribe");
      }
    } catch (error) {
      console.error("Error unsubscribing:", error);
      onToast?.("Failed to unsubscribe. Please try again.", "error");
    } finally {
      setSubscribing(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm">
      {/* Panel — slides up */}
      <div
        ref={panelRef}
        className="w-full max-w-2xl mb-0 bg-black/95 border border-white/10 border-b-0 rounded-t-3xl shadow-[0_-20px_80px_rgba(0,0,0,0.8)] flex flex-col max-h-[80vh] animate-slide-up"
      >
        {/* Handle + Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            {artworkUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={artworkUrl} alt={showName} className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Radio size={16} className="text-orange-400" />
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">Episode Vault</p>
              <h3 className="text-sm font-black tracking-tighter text-white leading-none">{showName}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-Distill Popover */}
            {feedUrl && (
              <Tooltip.Provider>
                <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
                  {subscribed ? (
                    // Active state - show manage button with popover for unsubscribe
                    <Popover.Trigger asChild>
                      <button
                        disabled={subscribing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all bg-orange-500/15 border-orange-500/40 text-orange-300 shadow-[0_0_12px_rgba(255,102,0,0.15)] disabled:opacity-50"
                      >
                        <Bell size={11} className="shrink-0" />
                        {subscribing ? "Saving…" : "Manage Automation"}
                        <span className="w-1 h-1 rounded-full bg-orange-400 animate-pulse" />
                      </button>
                    </Popover.Trigger>
                  ) : (
                    // Inactive state - show subscribe popover
                    <Popover.Trigger asChild>
                      <button
                        disabled={subscribing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all bg-white/[0.03] border-white/10 text-zinc-400 hover:border-orange-500/30 hover:text-orange-300 disabled:opacity-50"
                      >
                        <BellOff size={11} className="shrink-0" />
                        {subscribing ? "Saving…" : "Auto-Distill"}
                        
                        {/* Help Circle with Tooltip */}
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <span 
                              className="ml-1 p-0.5 rounded-full hover:bg-white/10 cursor-help"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <HelpCircle size={12} className="text-zinc-500" />
                            </span>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content
                              className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-300 max-w-[200px] shadow-xl"
                              sideOffset={5}
                            >
                              Automatically receive an audio brief in your inbox whenever a new episode drops.
                              <Tooltip.Arrow className="fill-white/10" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </button>
                    </Popover.Trigger>
                  )}

                  <Popover.Portal>
                    <Popover.Content
                      className="bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 w-[280px] shadow-[0_0_40px_rgba(0,0,0,0.8)] z-50"
                      sideOffset={8}
                      align="end"
                    >
                      {subscribed ? (
                        // Manage Automation Popover
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-1">Manage Automation</h4>
                            <p className="text-xs text-zinc-400">
                              You are subscribed to Auto-Distill for this show.
                            </p>
                          </div>
                          
                          <div className="pt-2 border-t border-white/10">
                            <p className="text-xs text-zinc-500 mb-2">
                              Preferred length: <span className="text-orange-400">{preferredLength}</span>
                            </p>
                          </div>

                          <button
                            onClick={handleUnsubscribe}
                            disabled={subscribing}
                            className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-sm text-white font-medium transition-all disabled:opacity-50"
                          >
                            {subscribing ? "Unsubscribing…" : "Unsubscribe"}
                          </button>
                        </div>
                      ) : (
                        // Subscribe Popover
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-1">Automate this Show</h4>
                            <p className="text-xs text-zinc-400">
                              Choose your default brief length for new episodes.
                            </p>
                          </div>

                          {/* Length Selector */}
                          <div className="bg-black/60 border border-white/10 rounded-full p-0.5 flex items-center">
                            {["3m", "5m", "10m"].map((length) => (
                              <button
                                key={length}
                                onClick={() => setPreferredLength(length)}
                                className={`flex-1 py-1.5 px-2 rounded-full text-[11px] font-medium transition-all ${
                                  preferredLength === length
                                    ? "bg-[#FF6600]/20 border border-[#FF6600]/50 text-[#FF8A00]"
                                    : "text-zinc-400 hover:text-white"
                                }`}
                              >
                                {length}
                              </button>
                            ))}
                          </div>

                          {/* Subscribe Button */}
                          <button
                            onClick={handleSubscribe}
                            disabled={subscribing}
                            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#FF6600] to-[#FF8A00] hover:opacity-90 rounded-lg text-sm text-white font-semibold transition-all shadow-[0_0_20px_rgba(255,102,0,0.3)] disabled:opacity-50"
                          >
                            {subscribing ? "Subscribing…" : "Subscribe"}
                          </button>
                        </div>
                      )}

                      <Popover.Arrow className="fill-white/10" />
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              </Tooltip.Provider>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Episode list */}
        <div className="overflow-y-auto flex-1 px-2 py-2">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-zinc-500">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Fetching episodes…</span>
            </div>
          ) : episodes.length === 0 ? (
            <p className="text-center text-sm text-zinc-600 py-16">No episodes found in this feed.</p>
          ) : (
            episodes.map((ep, i) => (
              <div
                key={i}
                className="group flex items-start justify-between gap-4 px-4 py-3.5 rounded-xl hover:bg-orange-500/5 hover:border-orange-500/20 border border-transparent transition-all cursor-default"
              >
                {/* Episode info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-orange-100 transition-colors">
                    {ep.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-zinc-500">{formatDate(ep.pubDate)}</span>
                    {ep.duration && (
                      <>
                        <span className="text-zinc-700">·</span>
                        <span className="text-[10px] text-zinc-500">{ep.duration}</span>
                      </>
                    )}
                  </div>
                  {ep.snippet && (
                    <p className="text-[11px] text-zinc-600 mt-1 line-clamp-2 leading-relaxed">{ep.snippet}</p>
                  )}
                </div>

                {/* Select button */}
                <button
                  onClick={() => onSelect(ep.audioUrl)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 hover:border-orange-500/40 text-orange-400 text-[11px] font-bold transition-all opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0"
                >
                  Select <ArrowRight size={11} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/5 shrink-0">
          <p className="text-[10px] text-zinc-600 text-center">
            Select an episode to populate the URL and generate your brief.
          </p>
        </div>
      </div>
    </div>
  );
}
