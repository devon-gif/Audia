"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles, Zap, Crown, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

type BillingCycle = "monthly" | "yearly";

interface PricingPlan {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  highlighted?: boolean;
  monthlyPriceId: string;
  yearlyPriceId: string;
}

const PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    icon: <Sparkles size={20} className="text-zinc-400" />,
    description: "Perfect for trying out Audia.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ["2 hours of audio/mo", "Standard processing", "Web dashboard only"],
    monthlyPriceId: "",
    yearlyPriceId: "",
  },
  {
    id: "pro",
    name: "Pro",
    icon: <Zap size={20} className="text-orange-400" />,
    description: "For serious learners and researchers.",
    monthlyPrice: 4.99,
    yearlyPrice: 3.99,
    features: ["15 hours of audio/mo", "Fast processing", "Notion export", "Automated Delivery"],
    highlighted: true,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY || "",
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY || "",
  },
  {
    id: "elite",
    name: "Elite",
    icon: <Crown size={20} className="text-zinc-400" />,
    description: "Unlimited power for power users.",
    monthlyPrice: 9.99,
    yearlyPrice: 7.99,
    features: ["50 hours of audio/mo", "Priority GPU processing", "Multilingual extraction", "Full API access"],
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_ELITE_MONTHLY || "",
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_ELITE_YEARLY || "",
  },
];

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  // Get user email on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUser();
  }, []);

  const handleCheckout = async (plan: PricingPlan) => {
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Not logged in - redirect to signup
      router.push("/signup");
      return;
    }

    if (plan.id === "free") {
      router.push("/dashboard");
      return;
    }

    const priceId = billingCycle === "monthly" ? plan.monthlyPriceId : plan.yearlyPriceId;
    
    if (!priceId) {
      console.error("Price ID not configured for", plan.id, billingCycle);
      alert("Pricing not configured. Please contact support.");
      return;
    }

    setLoadingPlanId(plan.id);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId, userEmail: user.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.assign(data.url);
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("[checkout] Error:", error);
      alert("Failed to start checkout. Please try again.");
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500/30 relative overflow-hidden">
      {/* Ambient Orange Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-orange-600/10 rounded-full blur-[150px] pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 py-6 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-tight text-white font-mono">
            Audia<span className="text-[#FF6600]">.</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">
              Log in
            </Link>
            <Link 
              href="/signup"
              className="px-5 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-sm text-white font-semibold hover:bg-white/10 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-20 pb-32 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Headline */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Predictable pricing. Infinite leverage.
            </h1>
            <p className="text-lg text-zinc-400 mb-8">
              Start for free, upgrade when you need more power.
            </p>
            
            {/* Billing Toggle */}
            <div className="inline-flex items-center p-1 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-full">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  billingCycle === "monthly"
                    ? "bg-white/10 text-white shadow-lg"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  billingCycle === "yearly"
                    ? "bg-white/10 text-white shadow-lg"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Yearly
                <span className="px-2 py-0.5 bg-[#FF6600] text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            
            {PLANS.map((plan) => {
              const currentPrice = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
              const annualTotal = (plan.yearlyPrice * 12).toFixed(2);
              const isLoading = loadingPlanId === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative backdrop-blur-sm border rounded-3xl p-8 flex flex-col ${
                    plan.highlighted
                      ? "bg-[#FF6600]/10 border-2 border-[#FF6600]/50 shadow-[0_0_40px_rgba(255,102,0,0.15)]"
                      : "bg-white/[0.02] border border-white/10"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-xs font-semibold text-white">
                      Most Popular
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="flex items-center gap-2 mb-4">
                    {plan.icon}
                    <span className={`text-sm font-semibold uppercase tracking-wider ${
                      plan.highlighted ? "text-orange-300" : "text-zinc-300"
                    }`}>
                      {plan.name}
                    </span>
                  </div>

                  {/* Price with Animation */}
                  <div className="flex items-baseline gap-1 mb-1">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={`${plan.id}-${billingCycle}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="text-4xl font-bold text-white tabular-nums"
                      >
                        ${currentPrice.toFixed(2)}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-zinc-500 text-lg">/mo</span>
                  </div>

                  {/* Billed annually subtext */}
                  <AnimatePresence mode="wait">
                    {billingCycle === "yearly" && plan.yearlyPrice > 0 && (
                      <motion.p
                        key={`annual-${plan.id}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-zinc-500 text-xs mb-6"
                      >
                        Billed as ${annualTotal}/yr
                      </motion.p>
                    )}
                  </AnimatePresence>
                  {billingCycle === "monthly" && <div className="h-5 mb-6" />}

                  <p className="text-zinc-400 text-sm mb-8">{plan.description}</p>
                  
                  {/* Features */}
                  <ul className="space-y-4 mb-8 flex-grow">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm text-zinc-300">
                        <Check size={16} className="text-orange-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {/* CTA Button */}
                  <button
                    onClick={() => handleCheckout(plan)}
                    disabled={isLoading}
                    className={`w-full py-3 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      plan.highlighted
                        ? "bg-white text-black font-semibold hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        : "border border-white/20 text-white hover:bg-white/5"
                    } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      plan.id === "free" ? "Get Started" : billingCycle === "yearly" ? "START YEARLY PLAN" : "Upgrade to " + plan.name
                    )}
                  </button>
                </div>
              );
            })}

          </div>

          {/* FAQ Teaser */}
          <div className="mt-16 text-center">
            <p className="text-zinc-400 text-sm">
              Questions? Check our <Link href="/help" className="text-orange-400 hover:text-orange-300 transition-colors">Help Center</Link> or <Link href="/contact" className="text-orange-400 hover:text-orange-300 transition-colors">contact support</Link>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
