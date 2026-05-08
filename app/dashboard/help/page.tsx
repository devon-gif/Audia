"use client";

import { useState } from "react";
import {
  LifeBuoy, Mail, PlayCircle, ChevronDown, Zap, Rss,
  CreditCard, BookOpen, MessageCircle,
} from "lucide-react";

// ─── FAQ Data ────────────────────────────────────────────────────────────────

const FAQS = [
  {
    id: "credits",
    icon: Zap,
    question: "How do generation credits work?",
    answer: `Every account starts on the Free tier with 3 generation credits per month. Each time you generate a brief — transcription + GPT distillation + ElevenLabs audio — one credit is consumed.

Upgrading changes your limits:
  • Free  →  3 generations / month
  • Pro ($4.99/mo)  →  15 generations / month
  • Max ($9.99/mo)  →  100 generations / month (fair-use guardrail to prevent abuse)

Credits reset on the 1st of each calendar month. Unused credits do not roll over. Developer accounts bypass the cap entirely.`,
  },
  {
    id: "rss",
    icon: Rss,
    question: "Can I summarize shows not in Apple Podcasts?",
    answer: `Yes. Any publicly available audio is supported. Just paste the direct .mp3 URL or the raw RSS feed URL into the input bar — Audia will automatically detect whether it's a feed or a direct file.

To find an RSS feed for any show:
  1. Search for it on Podcast Index (podcastindex.org).
  2. Copy the feed URL and paste it directly into Audia.
  3. Audia will pull the most recent episode automatically.

Private or paywalled feeds are not supported.`,
  },
  {
    id: "cancel",
    icon: CreditCard,
    question: "How do I cancel my subscription?",
    answer: `You can cancel anytime from the Billing page inside your dashboard — no phone calls, no dark patterns.

Navigate to Dashboard → Billing → Manage Subscription, then click 'Cancel Plan'. Your access continues until the end of the current billing period. After cancellation you drop back to the Free tier (3 credits/month) automatically.

If you're having trouble cancelling or were charged incorrectly, email devon@audia.ai and we'll resolve it within 24 hours.`,
  },
  {
    id: "voices",
    icon: MessageCircle,
    question: "Can I change the AI voice used for my brief?",
    answer: `Yes. Before generating a brief, open the Voice selector in the controls row and choose from four ElevenLabs voices:

  • Rachel (Calm)  — warm storytelling voice, great for long-form content
  • Sarah (Broadcast)  — US female, crisp broadcast delivery
  • Marcus (Executive)  — US male, authoritative and direct
  • George (Cinematic)  — UK male, dramatic and engaging

Each voice has a preview button so you can audition before committing. Your selection is remembered per session.`,
  },
  {
    id: "episodes",
    icon: BookOpen,
    question: "What is the Episode Vault?",
    answer: `The Episode Vault is a quick-browse panel that opens when you click any podcast cover in the Popular Shows grid.

It pulls the show's RSS feed and lists the 20 most recent episodes — including title, publish date, duration, and a short description snippet. Click 'Select' on any episode to instantly populate the input bar with that episode's audio URL.

You can also toggle 'Auto-Distill' for any show in the Episode Vault header. Once enabled, new episodes will be automatically summarized and added to your Library (requires an active subscription).`,
  },
];

// ─── Accordion item ───────────────────────────────────────────────────────────

function FaqItem({ faq }: { faq: typeof FAQS[number] }) {
  const [open, setOpen] = useState(false);
  const Icon = faq.icon;

  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
        open
          ? "border-orange-500/25 bg-orange-500/[0.03] shadow-[0_0_20px_rgba(255,102,0,0.06)]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
      }`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            open ? "bg-orange-500/15 text-orange-400" : "bg-white/5 text-zinc-500 group-hover:text-zinc-300"
          }`}>
            <Icon size={13} />
          </div>
          <span className={`text-sm font-semibold tracking-tight leading-snug transition-colors ${
            open ? "text-white" : "text-zinc-300 group-hover:text-white"
          }`}>
            {faq.question}
          </span>
        </div>
        <ChevronDown
          size={15}
          className={`shrink-0 text-zinc-500 transition-transform duration-300 ${open ? "rotate-180 text-orange-400" : ""}`}
        />
      </button>

      {/* Animated body */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          open ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-5 pt-0">
          <div className="pl-10">
            <pre className="text-[12.5px] text-zinc-400 leading-relaxed whitespace-pre-wrap font-sans">
              {faq.answer}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HelpPage() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-2xl mx-auto px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center">
              <LifeBuoy size={18} className="text-orange-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-orange-500/80">Support</p>
              <h1 className="text-xl font-black tracking-tighter text-white leading-none">Command Center</h1>
            </div>
          </div>
          <p className="text-sm text-zinc-500 leading-relaxed ml-[52px]">
            Everything you need to get the most out of Audia. Can&apos;t find your answer?{" "}
            <a
              href="mailto:devon@audia.ai?subject=Audia%20Support%20Request"
              className="text-orange-400 hover:text-orange-300 transition-colors"
            >
              We reply within 24 hours.
            </a>
          </p>
        </div>

        {/* Quick Actions grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {/* Video Tutorials */}
          <a
            href="https://www.youtube.com/@audia"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col justify-between p-5 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.07] hover:border-white/[0.15] rounded-2xl transition-all duration-200"
          >
            <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:border-white/20 transition-colors">
              <PlayCircle size={17} className="text-zinc-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-1">Video Tutorials</p>
              <p className="text-[11px] text-zinc-500 leading-snug">
                Watch step-by-step walkthroughs of every feature.
              </p>
            </div>
            <div className="mt-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">
              Open YouTube →
            </div>
          </a>

          {/* Contact Support */}
          <a
            href="mailto:devon@audia.ai?subject=Audia%20Support%20Request"
            className="group relative flex flex-col justify-between p-5 bg-orange-500/[0.06] hover:bg-orange-500/[0.10] border border-orange-500/20 hover:border-orange-500/40 rounded-2xl transition-all duration-200 shadow-[0_0_0_0_rgba(255,102,0,0)] hover:shadow-[0_0_24px_rgba(255,102,0,0.12)]"
          >
            {/* Subtle corner glow */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="w-9 h-9 bg-orange-500/15 border border-orange-500/30 rounded-xl flex items-center justify-center mb-4">
                <Mail size={17} className="text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">Contact Support</p>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Email our team directly. Human replies, no bots.
                </p>
              </div>
              <div className="mt-3 text-[10px] font-semibold text-orange-500/70 uppercase tracking-widest group-hover:text-orange-400 transition-colors">
                devon@audia.ai →
              </div>
            </div>
          </a>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-600">Frequently Asked</span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-2.5">
          {FAQS.map((faq) => (
            <FaqItem key={faq.id} faq={faq} />
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-10 p-5 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white mb-0.5">Still stuck?</p>
            <p className="text-[11px] text-zinc-500">We read every message and respond within one business day.</p>
          </div>
          <a
            href="mailto:devon@audia.ai?subject=Audia%20Support%20Request"
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FF7A00] to-[#E05A00] rounded-xl text-white font-bold text-xs shadow-[0_0_16px_rgba(255,120,0,0.25)] hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(255,120,0,0.35)] transition-all"
          >
            <Mail size={13} />
            Email Us
          </a>
        </div>

      </div>
    </div>
  );
}
