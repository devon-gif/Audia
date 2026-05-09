"use client";
import React from "react";
import { BookOpen, LifeBuoy, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HelpCenter() {
  const triggerOnboarding = () => {
    // We use a custom event so the Dashboard knows to show the modal again
    window.dispatchEvent(new Event('trigger-onboarding'));
    // Redirect to dashboard where the modal lives
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="flex items-center justify-between">
          <Link href="/dashboard" className="text-zinc-500 hover:text-white flex items-center gap-2 transition-colors">
            <ArrowLeft size={18} />
            Back to Studio
          </Link>
          <LifeBuoy className="text-orange-500" size={24} />
        </header>

        <section className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Support & Resources</h1>
          <p className="text-zinc-400 text-lg">Master the art of high-fidelity podcast distillation.</p>
        </section>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={triggerOnboarding}
            className="flex items-center gap-6 p-6 bg-zinc-900/50 border border-white/5 rounded-3xl hover:border-orange-500/50 hover:bg-zinc-900 transition-all group text-left"
          >
            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
              <BookOpen size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">Replay Setup Guide</h3>
              <p className="text-zinc-500">Walk through the Audia workflow and core features again.</p>
            </div>
          </button>
        </div>

        <footer className="pt-12 border-t border-white/5">
          <p className="text-zinc-600 text-sm">Audia v1.0 — Distilling the world’s noise into signal.</p>
        </footer>
      </div>
    </div>
  );
}
