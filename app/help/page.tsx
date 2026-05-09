"use client";
import React from "react";
import { BookOpen, LifeBuoy, ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HelpCenter() {
  const router = useRouter();

  const triggerOnboarding = () => {
    // 1. Mark onboarding as incomplete in the database (Optional, but ensures it pops)
    // 2. Redirect to dashboard and trigger the event
    router.push("/dashboard");
    setTimeout(() => {
      window.dispatchEvent(new Event('trigger-onboarding'));
    }, 600);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans selection:bg-orange-500/30">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="flex items-center justify-between">
          <Link href="/dashboard" className="text-zinc-500 hover:text-white flex items-center gap-2 transition-all">
            <ArrowLeft size={18} />
            Back to Studio
          </Link>
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full border border-white/5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400">Engine Online</span>
          </div>
        </header>

        <section className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tighter">Help Center</h1>
          <p className="text-zinc-400 text-xl max-w-xl leading-relaxed">Master the workflow. Distill hours of audio into narrative signal.</p>
        </section>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={triggerOnboarding}
            className="flex items-center gap-6 p-8 bg-zinc-900/40 border border-white/5 rounded-[2rem] hover:border-orange-500/50 hover:bg-zinc-900 transition-all group text-left"
          >
            <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform shadow-xl shadow-orange-500/5">
              <Zap size={28} fill="currentColor" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-1">Replay Interactive Guide</h3>
              <p className="text-zinc-500">Walk through the Step 1-2-3 setup and re-select your Big 3 favorites.</p>
            </div>
          </button>
        </div>

        <footer className="pt-12 border-t border-white/5 flex justify-between items-center">
          <p className="text-zinc-600 text-xs font-medium uppercase tracking-widest">Audia Neural Engine v1.0</p>
          <LifeBuoy size={20} className="text-zinc-800" />
        </footer>
      </div>
    </div>
  );
}
