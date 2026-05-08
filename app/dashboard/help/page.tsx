"use client";

import { useState, useEffect } from "react";
import {
  LifeBuoy, Mail, PlayCircle, ChevronDown, Zap, Rss,
  CreditCard, BookOpen, MessageCircle, Send, CheckCircle, Loader2,
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";

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
// ─── Contact Form ────────────────────────────────────────────────────────────

function ContactForm({ defaultEmail }: { defaultEmail: string }) {
  const [email, setEmail] = useState(defaultEmail);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (defaultEmail && !email) setEmail(defaultEmail);
  }, [defaultEmail, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-4 gap-3">
        <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-center">
          <CheckCircle size={20} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-white mb-1">Message received.</p>
          <p className="text-[11px] text-zinc-400 leading-relaxed max-w-[200px] mx-auto">
            The Audia team will reply to your email shortly.
          </p>
        </div>
        <button
          onClick={() => { setSent(false); setMessage(""); setError(null); }}
          className="text-[11px] text-zinc-500 hover:text-orange-400 transition-colors font-medium"
        >
          Send another message →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <div>
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
          Your Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none transition-all"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={3}
          placeholder="Describe your issue…"
          className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none transition-all resize-none"
        />
      </div>
      {error && (
        <p className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5">
          ⚠ {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading || !email.trim() || !message.trim()}
        className="flex items-center justify-center gap-2 w-full py-2 bg-gradient-to-r from-[#FF7A00] to-[#E05A00] rounded-xl text-white font-bold text-xs shadow-[0_0_12px_rgba(255,120,0,0.2)] hover:shadow-[0_0_20px_rgba(255,120,0,0.35)] hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {loading ? (
          <><Loader2 size={13} className="animate-spin" /> Sending…</>
        ) : (
          <><Send size={12} /> Send Message</>
        )}
      </button>
    </form>
  );
}
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
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserEmail(user.email);
    });
  }, []);

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
            Browse the FAQ or send us a message — we reply within 24 hours.
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

          {/* Contact Support — inline form */}
          <div className="relative flex flex-col p-5 bg-orange-500/[0.05] border border-orange-500/20 rounded-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 bg-orange-500/15 border border-orange-500/25 rounded-lg flex items-center justify-center shrink-0">
                  <Mail size={13} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-none">Message Support</p>
                  <p className="text-[10px] text-orange-500/70 mt-0.5">support@audia.ai</p>
                </div>
              </div>
              <ContactForm defaultEmail={userEmail} />
            </div>
          </div>
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
        <div className="mt-10 p-5 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex items-center gap-4">
          <div className="w-8 h-8 shrink-0 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center">
            <Mail size={14} className="text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white mb-0.5">Still stuck?</p>
            <p className="text-[11px] text-zinc-500">
              Use the contact form above — we read every message and respond within one business day.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
