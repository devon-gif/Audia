"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, CreditCard, ArrowRight, Check, Sparkles } from "lucide-react";

const PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY;
const ELITE_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_ELITE_MONTHLY;
const STARTER_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY;

async function startCheckout(
  priceId: string,
  userId: string | null,
  userEmail: string | null,
  setLoading: (v: boolean) => void,
  router: ReturnType<typeof useRouter>
) {
  if (!userId) {
    console.warn("[billing] No userId available — redirecting to login.");
    router.push("/login?returnTo=/dashboard/billing");
    return;
  }

  console.log("[billing] Starting checkout. User:", userId, "Price:", priceId);
  setLoading(true);

  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId, userEmail, userId }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("[billing] /api/checkout returned", res.status, errData);
      throw new Error(errData.error || `Checkout API error ${res.status}`);
    }

    const data = await res.json();
    if (data.url) {
      window.location.assign(data.url);
    } else {
      throw new Error(data.error || "No checkout URL returned");
    }
  } catch (err) {
    console.error("[billing] Checkout error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    alert("Checkout Error: " + msg);
    setLoading(false);
  }
}

interface BillingPageProps {
  userId?: string | null;
  userEmail?: string | null;
}

export default function BillingPage({ userId = null, userEmail = null }: BillingPageProps) {
  const router = useRouter();
  const [proLoading, setProLoading] = useState(false);
  const [eliteLoading, setEliteLoading] = useState(false);
  const [starterLoading, setStarterLoading] = useState(false);
  return (
    <div className="flex-1 overflow-auto p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-lg font-black tracking-tighter text-white mb-1">Billing & Plan</h1>
        <p className="text-xs text-zinc-500">Manage your subscription and payment details</p>
      </div>

      {/* Current plan card */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                Free Trial
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tighter text-white">Starter Plan</h2>
            <p className="text-xs text-zinc-500 mt-1">Free Trial — renews at $4.99/month</p>
          </div>
          <div className="w-10 h-10 bg-zinc-800 border border-white/10 rounded-xl flex items-center justify-center">
            <CreditCard size={18} className="text-zinc-400" />
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {[
            "1 AI summary per week",
            "Text-only Deep Signal briefs",
            "Web dashboard access",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 text-xs text-zinc-400">
              <Check size={13} className="text-orange-500 shrink-0" />
              {f}
            </div>
          ))}
        </div>

        <a
          href="#"
          onClick={(e) => { e.preventDefault(); alert("Stripe Checkout coming soon!"); }}
          className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <CreditCard size={14} />
          Manage Subscription
        </a>
      </div>

      {/* All 4 upgrade plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* Free / Trial */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Free</span>
          </div>
          <h2 className="text-2xl font-black tracking-tighter text-white mb-1">
            $0<span className="text-sm font-normal text-zinc-500">/mo</span>
          </h2>
          <p className="text-xs text-zinc-500 mb-4">Try Audia risk-free.</p>
          <div className="space-y-2 mb-6 flex-1">
            {[
              "1 summary per week",
              "Text briefs only",
              "Web dashboard",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-xs text-zinc-500">
                <Check size={12} className="text-zinc-600 shrink-0" />
                {f}
              </div>
            ))}
          </div>
          <div className="w-full py-2.5 text-center rounded-xl border border-white/10 text-xs text-zinc-500 font-semibold">
            Current Plan
          </div>
        </div>

        {/* Starter — $4.99 */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Crown size={13} className="text-zinc-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Starter</span>
          </div>
          <h2 className="text-2xl font-black tracking-tighter text-white mb-1">
            $4.99<span className="text-sm font-normal text-zinc-400">/mo</span>
          </h2>
          <p className="text-xs text-zinc-400 mb-4">Step up your signal.</p>
          <div className="space-y-2 mb-6 flex-1">
            {[
              "5 AI summaries per month",
              "Neural Audio Briefs",
              "Mobile PWA access",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-xs text-zinc-300">
                <Check size={12} className="text-zinc-400 shrink-0" />
                {f}
              </div>
            ))}
          </div>
          {!STARTER_PRICE_ID && (
            <p className="text-[11px] text-red-400/80 mb-2 text-center">⚠ Configuration Error</p>
          )}
          <button
            type="button"
            disabled={starterLoading || !STARTER_PRICE_ID}
            onClick={() => STARTER_PRICE_ID && startCheckout(STARTER_PRICE_ID, userId, userEmail, setStarterLoading, router)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {starterLoading ? "Redirecting…" : <><span>Get Starter</span> <ArrowRight size={14} /></>}
          </button>
        </div>

        {/* Pro — $9.99 */}
        <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/30 rounded-2xl p-5 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col flex-1">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                <Crown size={13} className="text-orange-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Pro</span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300">
                Popular
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tighter text-white mb-1">
              $9.99<span className="text-sm font-normal text-zinc-400">/mo</span>
            </h2>
            <p className="text-xs text-zinc-400 mb-4">Daily knowledge distillation.</p>
            <div className="space-y-2 mb-6 flex-1">
              {[
                "15 AI summaries per month",
                "Neural Audio Briefs",
                "Export to Notion / Obsidian",
                "Mobile PWA + offline",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs text-zinc-300">
                  <Check size={12} className="text-orange-400 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            {!PRO_PRICE_ID && (
              <p className="text-[11px] text-red-400/80 mb-2 text-center">⚠ Configuration Error</p>
            )}
            <button
              type="button"
              disabled={proLoading || !PRO_PRICE_ID}
              onClick={() => PRO_PRICE_ID && startCheckout(PRO_PRICE_ID, userId, userEmail, setProLoading, router)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#FF7A00] to-[#E05A00] rounded-xl text-white font-bold text-sm hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,120,0,0.3)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {proLoading ? "Redirecting…" : <><span>Upgrade to Pro</span> <ArrowRight size={14} /></>}
            </button>
          </div>
        </div>

        {/* Max — $19.99 */}
        <div className="relative rounded-2xl p-[1px] overflow-hidden flex flex-col" style={{ background: "linear-gradient(135deg, rgba(255,122,0,0.6) 0%, rgba(255,68,0,0.15) 50%, rgba(255,122,0,0.4) 100%)" }}>
          <div className="bg-[#0e0e0f] rounded-[calc(1rem-1px)] p-5 relative overflow-hidden flex flex-col flex-1">
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/8 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col flex-1">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Sparkles size={13} className="text-orange-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Max</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#E05A00] text-white shadow-[0_0_10px_rgba(255,120,0,0.4)]">
                  Best Value
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tighter text-white mb-1">
                $19.99<span className="text-sm font-normal text-zinc-400">/mo</span>
              </h2>
              <p className="text-xs text-zinc-400 mb-4">Extreme knowledge synthesis.</p>
              <div className="space-y-2 mb-6 flex-1">
                {[
                  "100 AI summaries / month",
                  "Neural Audio Briefs",
                  "Automated Email Delivery",
                  "Private RSS integration",
                  "Priority processing",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-zinc-200">
                    <Check size={12} className="text-orange-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              {!ELITE_PRICE_ID && (
                <p className="text-[11px] text-red-400/80 mb-2 text-center">⚠ Configuration Error</p>
              )}
              <button
                type="button"
                disabled={eliteLoading || !ELITE_PRICE_ID}
                onClick={() => ELITE_PRICE_ID && startCheckout(ELITE_PRICE_ID, userId, userEmail, setEliteLoading, router)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/[0.06] hover:bg-white/[0.10] border border-orange-500/40 hover:border-orange-500/70 rounded-xl text-white font-bold text-sm transition-all hover:shadow-[0_0_24px_rgba(255,120,0,0.25)] hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {eliteLoading ? "Redirecting…" : <><span>Upgrade to Max</span> <ArrowRight size={14} /></>}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
