"use client";

import { useRouter } from "next/navigation";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const router = useRouter();

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
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Predictable pricing. Infinite leverage.
            </h1>
            <p className="text-lg text-zinc-400">
              Start for free, upgrade when you need more power.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Free Tier */}
            <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={20} className="text-zinc-400" />
                <span className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Free</span>
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-zinc-500">/mo</span>
              </div>
              <p className="text-zinc-400 text-sm mb-8">Perfect for trying out Audia.</p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-zinc-300">
                  <Check size={16} className="text-orange-400" />
                  2 hours of audio/mo
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-300">
                  <Check size={16} className="text-orange-400" />
                  Standard processing
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-300">
                  <Check size={16} className="text-orange-400" />
                  Web dashboard only
                </li>
              </ul>
              
              <button 
                onClick={() => router.push("/signup")}
                className="w-full py-3 border border-white/20 rounded-full text-white font-medium hover:bg-white/5 transition-all"
              >
                Get Started
              </button>
            </div>

            {/* Pro Tier - Highlighted */}
            <div className="bg-[#FF6600]/10 backdrop-blur-sm border-2 border-[#FF6600]/50 rounded-3xl p-8 relative shadow-[0_0_40px_rgba(255,102,0,0.15)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-xs font-semibold text-white">
                Most Popular
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Zap size={20} className="text-orange-400" />
                <span className="text-sm font-semibold text-orange-300 uppercase tracking-wider">Pro</span>
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-white">$4.99</span>
                <span className="text-zinc-500">/mo</span>
              </div>
              <p className="text-zinc-400 text-sm mb-8">For serious learners and researchers.</p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-zinc-300">
                  <Check size={16} className="text-orange-400" />
                  15 hours of audio/mo
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-300">
                  <Check size={16} className="text-orange-400" />
                  Fast processing
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-300">
                  <Check size={16} className="text-orange-400" />
                  Notion export
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-300">
                  <Check size={16} className="text-orange-400" />
                  Automated Delivery
                </li>
              </ul>
              
              <button 
                onClick={() => router.push("/signup")}
                className="w-full py-3 bg-white rounded-full text-black font-semibold hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                START 7-DAY FREE TRIAL
              </button>
            </div>

            {/* Max Tier */}
            <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <div className="flex items-center gap-2 mb-4">
                <Crown size={20} className="text-zinc-400" />
                <span className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Max</span>
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-white">$9.99</span>
                <span className="text-zinc-500">/mo</span>
              </div>
              <p className="text-zinc-400 text-sm mb-8">Unlimited power for power users.</p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-zinc-300">
                  <Check size={16} className="text-orange-400" />
                  50 hours of audio/mo
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-300">
                  <Check size={16} className="text-orange-400" />
                  Priority GPU processing
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-300">
                  <Check size={16} className="text-orange-400" />
                  Multilingual extraction
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-300">
                  <Check size={16} className="text-orange-400" />
                  Full API access
                </li>
              </ul>
              
              <button 
                onClick={() => router.push("/signup")}
                className="w-full py-3 border border-white/20 rounded-full text-white font-medium hover:bg-white/5 transition-all"
              >
                Upgrade to Max
              </button>
            </div>
            
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
