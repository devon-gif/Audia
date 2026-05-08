"use client";

import { Shield, Lock, Eye, Server, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  const sections = [
    {
      icon: Shield,
      title: "Our Commitment to Privacy",
      content: "At Audia, we believe your listening habits and personal data belong to you alone. We've built our platform with privacy as a foundational principle, not an afterthought. Your trust is our most valuable asset."
    },
    {
      icon: Server,
      title: "Local-First Architecture",
      content: "Unlike cloud-dependent services, Audia processes your audio summaries locally on your personal device. When you initiate a summary, the work happens on your own iMac or designated 'server' node. Your raw audio data never leaves your personal infrastructure unless you explicitly choose to share it."
    },
    {
      icon: Lock,
      title: "Data Collection & Storage",
      content: "We collect only what is necessary to provide our service: your search queries, summary preferences, and account information. All stored data is encrypted at rest using industry-standard AES-256 encryption. We do not sell, trade, or rent your personal information to third parties."
    },
    {
      icon: Eye,
      title: "Third-Party Services",
      content: "We use Fish Audio for voice synthesis capabilities. When you generate AI voice summaries, audio snippets are processed through their secure infrastructure. We maintain strict data processing agreements with all partners and never share your personal listening history or search patterns."
    }
  ];

  return (
    <main className="min-h-screen bg-[#0a0500] text-white font-sans selection:bg-orange-500/30">
      {/* Navigation */}
      <nav className="max-w-6xl mx-auto px-6 md:px-12 py-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-orange-100/60 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Header */}
      <header className="max-w-4xl mx-auto px-6 md:px-12 pt-12 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-xs font-bold uppercase tracking-widest mb-6">
          <Shield size={14} />
          Legal
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white via-orange-100 to-orange-500/50 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <p className="text-lg text-orange-100/60 max-w-2xl mx-auto leading-relaxed">
          Your data stays yours. Here's exactly how we handle your information.
        </p>
        <p className="text-sm text-orange-100/40 mt-4">Last updated: May 7, 2026</p>
      </header>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 pb-24">
        <div className="grid gap-6">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-[45px] border border-white/10 rounded-3xl p-8 md:p-10 hover:border-orange-500/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
                  <section.icon size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-3">{section.title}</h2>
                  <p className="text-orange-100/70 leading-relaxed">{section.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Legal Text */}
        <div className="mt-12 bg-white/5 backdrop-blur-[45px] border border-white/10 rounded-3xl p-8 md:p-10">
          <h3 className="text-lg font-bold mb-4">Your Rights</h3>
          <ul className="space-y-3 text-orange-100/70">
            <li className="flex items-start gap-3">
              <span className="text-orange-500 mt-1">•</span>
              <span><strong>Right to Access:</strong> Request a copy of all data we hold about you.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 mt-1">•</span>
              <span><strong>Right to Deletion:</strong> Request complete removal of your account and associated data.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 mt-1">•</span>
              <span><strong>Right to Portability:</strong> Export your summaries and preferences in a standard format.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 mt-1">•</span>
              <span><strong>Right to Object:</strong> Opt-out of any future data processing initiatives.</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-orange-100/50">
            Questions about your privacy? Contact us at{" "}
            <a href="mailto:privacy@audia.app" className="text-orange-400 hover:text-orange-300 transition-colors">
              privacy@audia.app
            </a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/50 backdrop-blur-[45px] py-8">
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xl font-bold tracking-tight text-white">
            Audia<span className="text-orange-500">.</span>
          </div>
          <div className="flex gap-8 text-sm text-orange-100/50">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
          <p className="text-xs text-orange-100/40">© 2026 Audia Labs.</p>
        </div>
      </footer>
    </main>
  );
}
