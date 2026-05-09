"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, CreditCard, ArrowRight, Check, Sparkles, X, Zap } from "lucide-react";

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
  activePlan?: "free" | "starter" | "pro" | "max";
}

export default function BillingPage({ userId = null, userEmail = null, activePlan = "free" }: BillingPageProps) {
  const router = useRouter();
  const [proLoading, setProLoading] = useState(false);
  const [eliteLoading, setEliteLoading] = useState(false);
  const [starterLoading, setStarterLoading] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const retentionOffer: Record<string, { price: string; savings: string }> = {
    starter: { price: "$2.49", savings: "50% off" },
    pro:     { price: "$4.99", savings: "50% off" },
    max:     { price: "$9.99", savings: "50% off" },
  };
  const offer = retentionOffer[activePlan] ?? null;

  const handleClaimOffer = () => {
    console.log("[billing] User claimed retention offer:", activePlan, offer?.price);
    setIsCancelModalOpen(false);
    // TODO: apply coupon / discounted subscription via Stripe
  };

  const handleProceedCancel = () => {
    console.log("[billing] User proceeded to cancel:", activePlan);
    setIsCancelModalOpen(false);
    // TODO: redirect to Stripe customer portal cancel flow
  };

  return (
    <div className="flex-1 overflow-auto p-8 max-w-4xl">
      {/* ── Cancel Retention Modal ── */}
      {isCancelModalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setIsCancelModalOpen(false)}
        >
          <div
            className="relative bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full mx-4 shadow-[0_0_80px_rgba(0,0,0,0.7)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close button */}
            <button
              onClick={() => setIsCancelModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
            >
              <X size={15} />
            </button>

            <div className="relative z-10">
              {/* Icon */}
              <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mb-5">
                <Zap size={22} className="text-orange-400" />
              </div>

              {/* Headline */}
              <h2 className="text-2xl font-black tracking-tighter text-white mb-2">Before you go...</h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Keep your Intelligence Hub active. Claim this exclusive offer to get
                <span className="text-white font-semibold"> 3 months of your current plan </span>
                at a heavily discounted rate.
              </p>

              {/* Offer card */}
              {offer && (
                <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/25 rounded-2xl p-5 mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-1">{offer.savings} — Limited Time</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black tracking-tighter text-white">{offer.price}</span>
                    <span className="text-sm text-zinc-400 mb-1">/mo for 3 months</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">Then resumes at your normal rate. Cancel anytime.</p>
                </div>
              )}

              {/* Actions */}
              <button
                onClick={handleClaimOffer}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#FF7A00] to-[#E05A00] rounded-xl text-white font-bold text-sm hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,120,0,0.3)] mb-3"
              >
                <Zap size={14} />
                Claim Offer &amp; Stay
              </button>
              <button
                onClick={handleProceedCancel}
                className="w-full py-2.5 rounded-xl text-xs text-zinc-500 hover:text-red-400 border border-white/5 hover:border-red-500/20 transition-all"
              >
                Proceed to Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
        {activePlan !== "free" && (
          <button
            onClick={() => setIsCancelModalOpen(true)}
            className="w-full mt-3 text-xs text-zinc-600 hover:text-red-400 transition-colors py-1"
          >
            Cancel Subscription
          </button>
        )}
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
