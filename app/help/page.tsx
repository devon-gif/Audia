"use client";

import { useState } from "react";
import { 
  Search, ArrowLeft, User, CreditCard, Brain, Smartphone, Wrench,
  HelpCircle, ChevronRight, MessageCircle, Shield, Download
} from "lucide-react";
import Link from "next/link";

const categories = [
  {
    icon: User,
    title: "Account & Billing",
    description: "Manage subscriptions, payments, and account settings",
    articles: ["Upgrade your plan", "Cancel subscription", "Update payment method", "View invoice history"],
    color: "from-orange-400 to-orange-600"
  },
  {
    icon: Brain,
    title: "AI Processing",
    description: "Understanding how our AI summarizes and generates audio",
    articles: ["How summaries work", "Voice model selection", "Processing time", "Local vs cloud processing"],
    color: "from-blue-400 to-blue-600"
  },
  {
    icon: Smartphone,
    title: "PWA Setup",
    description: "Install Audia on your mobile device for quick access",
    articles: ["iPhone installation", "Android installation", "Offline mode", "Push notifications"],
    color: "from-emerald-400 to-emerald-600"
  },
  {
    icon: Wrench,
    title: "Troubleshooting",
    description: "Common issues and how to resolve them quickly",
    articles: ["Summary failed", "Audio not playing", "Login issues", "Sync problems"],
    color: "from-violet-400 to-violet-600"
  }
];

const quickAnswers = [
  {
    question: "How do I add Audia to my iPhone?",
    answer: "Open Audia in Safari, tap the Share button, then select 'Add to Home Screen'. The app will install as a PWA with full offline capabilities."
  },
  {
    question: "Is my audio data stored on your servers?",
    answer: "No. All audio processing happens locally on your designated iMac or personal server node. Your raw audio never touches our cloud infrastructure—only metadata and summary results are synced."
  },
  {
    question: "How long does AI summarization take?",
    answer: "A 2-hour podcast typically processes in 3-5 minutes on a modern iMac. Times vary based on your local hardware and the complexity of the audio."
  },
  {
    question: "Can I export my summaries?",
    answer: "Yes—Pro and Elite users can export to Notion, Obsidian, or download as Markdown. The export button appears on every summary page."
  },
  {
    question: "What audio formats are supported?",
    answer: "We support MP3, M4A, WAV, and most podcast RSS feeds. YouTube links are processed by extracting the audio stream locally."
  }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-[#0a0500] text-white font-sans selection:bg-orange-500/30 overflow-x-hidden relative">
      {/* Ambient Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-orange-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen z-0" />

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold tracking-tight text-white cursor-pointer hover:text-orange-200 transition-colors">
            Audia<span className="text-orange-500">.</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/help" className="text-sm text-white hover:text-orange-200 transition-colors hidden md:block">Help</Link>
            <Link href="/contact" className="text-sm text-orange-100/60 hover:text-white transition-colors hidden md:block">Contact</Link>
            <button className="px-5 py-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-xs text-white uppercase tracking-widest hover:bg-white/20 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20 transition-all">
              Login
            </button>
          </div>
        </nav>

        {/* Header */}
        <header className="max-w-4xl mx-auto px-6 md:px-12 pt-12 pb-16 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-orange-100/60 hover:text-white transition-colors text-sm mb-8"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white via-orange-100 to-orange-500/50 bg-clip-text text-transparent">
            Help Center
          </h1>
          <p className="text-lg text-orange-100/60 max-w-2xl mx-auto leading-relaxed">
            Find answers, learn how Audia works, and get the most out of your AI summaries.
          </p>
        </header>

        {/* Search Bar */}
        <section className="max-w-2xl mx-auto px-6 md:px-12 mb-16">
          <div className="relative">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search size={20} className="text-orange-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation..."
              className="w-full bg-white/5 backdrop-blur-[45px] border border-white/10 rounded-2xl pl-14 pr-5 py-4 text-lg text-white placeholder:text-white/30 outline-none focus:border-orange-500/30 transition-colors"
            />
          </div>
        </section>

        {/* Categories Grid */}
        <section className="max-w-6xl mx-auto px-6 md:px-12 mb-20">
          <h2 className="text-2xl font-bold mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                className="p-8 rounded-[2.5rem] bg-white/5 backdrop-blur-[45px] border border-white/10 hover:border-orange-500/30 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/10 transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                    <category.icon size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      {category.title}
                      <ChevronRight size={18} className="text-orange-100/40 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-orange-100/60 text-sm mb-4">{category.description}</p>
                    <ul className="space-y-2">
                      {category.articles.map((article, i) => (
                        <li key={i} className="text-sm text-orange-100/40 hover:text-orange-100/70 transition-colors cursor-pointer flex items-center gap-2">
                          <span className="w-1 h-1 bg-orange-500/50 rounded-full" />
                          {article}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Answers / FAQ */}
        <section className="max-w-3xl mx-auto px-6 md:px-12 mb-24">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <HelpCircle size={24} className="text-orange-500" />
            <h2 className="text-2xl font-bold">Quick Answers</h2>
          </div>
          
          <div className="space-y-4">
            {quickAnswers.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl bg-white/5 backdrop-blur-[45px] border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold pr-4">{faq.question}</span>
                  <ChevronRight 
                    size={20} 
                    className={`text-orange-500 flex-shrink-0 transition-transform ${expandedFaq === index ? "rotate-90" : ""}`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6 text-orange-100/70 leading-relaxed border-t border-white/5 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="max-w-2xl mx-auto px-6 md:px-12 mb-24">
          <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-orange-500/20 to-amber-500/10 backdrop-blur-[45px] border border-orange-500/30 text-center">
            <MessageCircle size={40} className="text-orange-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-3">Still need help?</h3>
            <p className="text-orange-100/70 mb-6">
              Can not find what you are looking for? Our support team is here for you.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/40 transition-all"
            >
              Contact Support
              <ChevronRight size={18} />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/50 backdrop-blur-xl py-8">
          <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xl font-bold tracking-tight text-white">
              Audia<span className="text-orange-500">.</span>
            </div>
            <div className="flex gap-8 text-sm text-orange-100/50">
              <Link href="/help" className="hover:text-white transition-colors">Help</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
            <div className="flex items-center gap-2 text-xs text-orange-100/40">
              <Shield size={14} /> Local processing security.
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
