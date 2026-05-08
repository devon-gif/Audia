"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Search, Mic, Layout, Share2, ArrowRight, Play, Pause,
  FileText, ArrowLeft, Download, Zap, Headphones, Shield, Sparkles, Star, Check,
  Clock, Volume2, Lock, User, Users, HelpCircle, Activity, Speaker, Crown, SkipBack, SkipForward,
  Link as LinkIcon, Globe, Quote
} from "lucide-react";
import Link from "next/link";
import LibraryView from "./components/LibraryView";

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-white/10 py-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-lg font-medium text-white">{question}</span>
        <span className={`text-orange-400 transition-transform ${isOpen ? 'rotate-45' : ''}`}>+</span>
      </button>
      {isOpen && (
        <p className="mt-4 text-zinc-400 leading-relaxed">
          {answer}
        </p>
      )}
    </div>
  );
}

const liveSummaries = [
  { podcast: "Huberman Lab #156", saved: "108 min" },
  { podcast: "Lex Fridman #412", saved: "142 min" },
  { podcast: "Theo Von #245", saved: "67 min" },
  { podcast: "Joe Rogan #2154", saved: "185 min" },
  { podcast: "Tim Ferriss #711", saved: "95 min" },
  { podcast: "Lex Fridman #398", saved: "156 min" },
];

const mockPodcast = {
  show: "Lex Fridman Podcast",
  title: "Sam Altman: OpenAI, GPT-5, Sora, and AGI",
  originalLength: "2h 14m",
  aiAudioLength: "4m 12s",
  keyTakeaways: [
    "GPT-5 is expected to be a massive leap in raw reasoning capabilities, moving beyond simple pattern matching.",
    "Sora's ability to understand physics is an 'emergent property' of scaling the video generation model.",
    "The timeline for AGI is compressing, but global compute power and energy grids remain the primary bottlenecks."
  ]
};

export default function LandingPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "searching" | "found">("idle");
  const [soundOn, setSoundOn] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<"maya" | "caleb">("maya");
  const [activeView, setActiveView] = useState<"new-summary" | "library">("new-summary");
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const router = useRouter();

  const handleSummarize = () => {
    if (!query) return;
    // Immediately redirect to signup for conversion
    router.push("/signup");
  };

  const handleReset = () => {
    setQuery("");
    setStatus("idle");
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-orange-500/30 overflow-x-hidden relative">
      
      {/* --- FILM GRAIN OVERLAY --- */}
      <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* --- DEEP AMBIENT GLOWS --- */}
      <div className="fixed top-[-15%] left-[-10%] w-[50vw] h-[50vw] bg-[#FF6600]/15 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-15%] w-[45vw] h-[45vw] bg-[#FF6600]/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="fixed top-[40%] left-[60%] w-[30vw] h-[30vw] bg-white/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Content wrapper to sit above the ambient glows */}
      <div className="relative z-10 pb-24 md:pb-0">
        
        {/* --- FULL-WIDTH GLASS HEADER --- */}
        <header className="absolute top-0 left-0 right-0 z-50 py-6 px-6 md:px-12">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Logo */}
            <div className="text-2xl font-bold tracking-tight text-white font-mono cursor-pointer" onClick={handleReset}>
              Audia.
            </div>
            
            {/* Center Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/#features" className="text-sm text-white/70 hover:text-white transition-colors">Features</Link>
              <Link href="/#pricing" className="text-sm text-white/70 hover:text-white transition-colors">Pricing</Link>
              <Link href="/#integrations" className="text-sm text-white/70 hover:text-white transition-colors">Integrations</Link>
              <Link href="/changelog" className="text-sm text-white/70 hover:text-white transition-colors">Changelog</Link>
            </nav>
            
            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">
                Log in
              </Link>
              <button 
                onClick={() => router.push("/signup")}
                className="px-5 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-sm text-white font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <Download size={16} />
                Download Mac App
              </button>
            </div>
          </div>
        </header>

        {/* --- COMMAND CENTER HERO --- */}
        <section className="relative h-screen w-full flex flex-col items-center justify-center pt-24 pb-8 overflow-hidden">
          
          {/* Video Backdrop with Mask */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="w-full h-full object-cover opacity-50 pointer-events-none"
              style={{
                maskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)',
              }}
            >
              <source src="/Seedance 2_0 - A high-end_ cinematic ambient background loop_ Subtle_ slow-moving golden light beams.mp4" type="video/mp4" />
            </video>
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />
          </div>
          
          {/* Main Content Container */}
          <div className="relative z-10 w-full max-w-6xl mx-auto px-6 flex flex-col items-center">
            
            {/* Hero Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-4 text-center bg-gradient-to-b from-white via-[#FFE8D6] to-[#FF8A00] bg-clip-text text-transparent">
              Turn Hours of Audio<br />
              Into Minutes of Insight.
            </h1>
            
            <p className="text-base md:text-lg text-zinc-400 max-w-xl mx-auto mb-6 text-center leading-relaxed">
              Audia is your personal AI curator for the world&apos;s longest conversations.<br />
              Transform dense podcasts into clear, actionable briefs.
            </p>
            
            {/* Social Proof */}
            <div className="flex items-center justify-center gap-6 mb-6">
              {/* Avatars + 50K+ */}
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 border-2 border-black overflow-hidden" />
                  ))}
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-black flex items-center justify-center text-[10px] font-bold text-zinc-300 ml-1">
                  50K+
                </div>
              </div>
              {/* Stars + Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} size={14} className="text-[#FF8A00] fill-[#FF8A00]" />
                  ))}
                </div>
                <span className="text-sm font-bold text-white">4.9/5</span>
                <span className="text-sm text-zinc-500">Trusted by 50,000+ listeners, researchers, and founders</span>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <button 
                onClick={() => router.push("/signup")}
                className="px-8 py-4 bg-gradient-to-r from-[#FF7A00] to-[#E05A00] rounded-full text-white font-semibold text-base flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,122,0,0.5)]"
              >
                START FREE TRIAL <ArrowRight size={18} />
              </button>
              <button 
                onClick={() => setStatus("found")}
                className="px-8 py-4 bg-black/50 backdrop-blur-md border border-white/20 rounded-full text-white font-medium text-base flex items-center gap-2 hover:bg-white/10 transition-all"
              >
                <Play size={18} fill="white" /> See How It Works
              </button>
            </div>
            
            {/* Dashboard Preview - Scaled Down */}
            <div className="relative w-full max-w-5xl">
              {/* Film Grain Overlay */}
              <div className="absolute inset-0 z-[2] pointer-events-none opacity-[0.03] rounded-3xl" 
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              />
              
              {/* Scaled Dashboard Container */}
              <div className="bg-white/[0.03] backdrop-blur-[60px] border border-white/10 rounded-3xl overflow-hidden shadow-2xl transform scale-[0.65] origin-top">
                {/* Dashboard Content - Simplified Preview */}
                <div className="flex min-h-[500px]">
                  
                  {/* Left Sidebar */}
                  <div className="w-[200px] bg-black/30 border-r border-white/5 p-5 flex flex-col">
                    <div className="text-lg font-bold text-white mb-6">Audia.</div>
                    <nav className="space-y-1 flex-1">
                      <button 
                        onClick={() => setActiveView("new-summary")}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                          activeView === "new-summary" 
                            ? "bg-gradient-to-r from-orange-500/20 to-transparent border border-orange-500/30 text-white" 
                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Sparkles size={14} className={activeView === "new-summary" ? "text-orange-400" : ""} />
                        New Summary
                      </button>
                      <button 
                        onClick={() => setActiveView("library")}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                          activeView === "library" 
                            ? "bg-gradient-to-r from-orange-500/20 to-transparent border border-orange-500/30 text-white" 
                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Layout size={14} className={activeView === "library" ? "text-orange-400" : ""} />
                        Library
                      </button>
                      <button className="w-full flex items-center gap-2 px-3 py-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg text-xs transition-all">
                        <Star size={14} />
                        Highlights
                      </button>
                      <button className="w-full flex items-center gap-2 px-3 py-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg text-xs transition-all">
                        <FileText size={14} />
                        Templates
                      </button>
                    </nav>
                    <div className="mt-4 p-3 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-orange-500/20 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Crown size={12} className="text-orange-400" />
                        <span className="text-xs font-semibold text-white">Pro Plan</span>
                      </div>
                      <button className="w-full py-1.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded text-[10px] text-orange-300 font-medium transition-all">
                        Upgrade
                      </button>
                    </div>
                  </div>
                  
                  {/* Main Area */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {activeView === "new-summary" ? (
                      <>
                        <div className="flex items-center justify-between mb-4 px-6 pt-6">
                          <h3 className="text-sm font-semibold text-white">New Summary</h3>
                          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                            Engine Online
                          </div>
                        </div>
                        
                        {/* Search Bar */}
                        <div className="px-6">
                          <div className="flex gap-2 mb-4">
                            <div className="flex-1 relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input 
                          type="text" 
                          placeholder="Paste podcast URL..."
                          className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50"
                        />
                      </div>
                      <button className="px-4 py-2 bg-gradient-to-r from-[#FF7A00] to-[#E05A00] rounded-lg text-white font-semibold text-xs flex items-center gap-1 hover:scale-105 transition-all">
                        SUMMARIZE <ArrowRight size={12} />
                      </button>
                    </div>
                    
                    {/* Controls Row - Target Length & Voice */}
                    <div className="flex items-center gap-4 mt-3">
                      {/* Target Length */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Length:</span>
                        <div className="bg-black/60 border border-white/10 rounded-full p-0.5 flex items-center">
                          <button className="px-2 py-1 rounded-full text-[10px] text-zinc-400 hover:text-white transition-all">3m</button>
                          <button className="px-2 py-1 rounded-full text-[10px] bg-[#FF6600]/20 border border-[#FF6600]/50 text-[#FF8A00] shadow-[0_0_8px_rgba(255,102,0,0.2)]">5m</button>
                          <button className="px-2 py-1 rounded-full text-[10px] text-zinc-400 hover:text-white transition-all">10m</button>
                        </div>
                      </div>
                      
                      {/* Voice Selector */}
                      <div className="relative group">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-full text-sm text-zinc-300 transition-all">
                          <Speaker size={14} />
                          <span className="text-[10px]">Voice: Marcus (US)</span>
                          <ArrowRight size={12} className="rotate-90" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        <div className="absolute top-full left-0 mt-2 w-56 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-2 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all z-50">
                          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 px-2">Select Voice</div>
                          
                          {/* Marcus */}
                          <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#FF6600]/10 transition-colors">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-[10px] font-bold">M</div>
                              <div className="text-left">
                                <div className="text-xs text-white">Marcus</div>
                                <div className="text-[10px] text-zinc-500">US Male • Authoritative</div>
                              </div>
                            </div>
                            <Check size={14} className="text-[#FF6600]" />
                          </button>
                          
                          {/* Sarah */}
                          <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#FF6600]/10 transition-colors">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-pink-700 rounded-full flex items-center justify-center text-[10px] font-bold">S</div>
                              <div className="text-left">
                                <div className="text-xs text-white">Sarah</div>
                                <div className="text-[10px] text-zinc-500">US Female • Conversational</div>
                              </div>
                            </div>
                          </button>
                          
                          {/* George */}
                          <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#FF6600]/10 transition-colors">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-[10px] font-bold">G</div>
                              <div className="text-left">
                                <div className="text-xs text-white">George</div>
                                <div className="text-[10px] text-zinc-500">UK Male • Analytical</div>
                              </div>
                            </div>
                          </button>
                          
                          {/* Charlotte */}
                          <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#FF6600]/10 transition-colors">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-[10px] font-bold">C</div>
                              <div className="text-left">
                                <div className="text-xs text-white">Charlotte</div>
                                <div className="text-[10px] text-zinc-500">UK Female • Sophisticated</div>
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Summary Brief Label */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Summary Brief</span>
                      <span className="text-[10px] text-zinc-500">1:42:18</span>
                    </div>
                    
                    {/* 4-Column Bento Grid */}
                    <div className="grid grid-cols-4 gap-3 flex-1">
                      {/* Key Takeaways */}
                      <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                        <h4 className="text-[10px] font-semibold text-zinc-300 uppercase mb-2">Key Takeaways</h4>
                        <ul className="space-y-1.5">
                          <li className="text-[9px] text-zinc-400">Deep work is a superpower</li>
                          <li className="text-[9px] text-zinc-400">Schedule focus time</li>
                          <li className="text-[9px] text-zinc-400">Avoid shallow work</li>
                        </ul>
                      </div>
                      
                      {/* Chapters */}
                      <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                        <h4 className="text-[10px] font-semibold text-zinc-300 uppercase mb-2">Chapters</h4>
                        <div className="space-y-1">
                          <div className="flex gap-2 text-[9px]">
                            <span className="text-zinc-500">00:00</span>
                            <span className="text-zinc-300">Distraction Crisis</span>
                          </div>
                          <div className="flex gap-2 text-[9px]">
                            <span className="text-zinc-500">12:45</span>
                            <span className="text-zinc-300">Deep Work Is</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Quote */}
                      <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                        <h4 className="text-[10px] font-semibold text-zinc-300 uppercase mb-2">Quote</h4>
                        <blockquote className="text-[9px] text-zinc-300 italic">
                          &quot;You can do anything, but not everything.&quot;
                        </blockquote>
                        <p className="text-[8px] text-zinc-500 mt-1">— Cal Newport</p>
                      </div>
                      
                      {/* Action Items */}
                      <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                        <h4 className="text-[10px] font-semibold text-zinc-300 uppercase mb-2">Actions</h4>
                        <div className="space-y-1">
                          <label className="flex items-start gap-1.5">
                            <div className="w-3 h-3 border border-zinc-600 rounded mt-0.5"></div>
                            <span className="text-[9px] text-zinc-400">Audit distractions</span>
                          </label>
                          <label className="flex items-start gap-1.5">
                            <div className="w-3 h-3 border border-zinc-600 rounded mt-0.5"></div>
                            <span className="text-[9px] text-zinc-400">Block deep work time</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>
                
                {/* Audio Player Bar */}
                <div className="bg-black/40 border-t border-white/5 px-5 py-3">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded flex items-center justify-center">
                      <span className="text-[6px] text-zinc-500">Focus</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-zinc-400 hover:text-white"><SkipBack size={14} /></button>
                      <button className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
                        <Play size={12} fill="black" className="text-black ml-0.5" />
                      </button>
                      <button className="text-zinc-400 hover:text-white"><SkipForward size={14} /></button>
                    </div>
                    <span className="text-[10px] text-zinc-400">1.25x</span>
                  </div>
                </div>
              </div>
              
              {/* Headphones - Positioned on Dashboard Corner */}
              <div className="absolute -bottom-4 -right-8 w-48 h-48 pointer-events-none z-10">
                <Image
                  src="/headphones.png"
                  alt="Premium headphones"
                  width={192}
                  height={192}
                  className="w-full h-full object-contain drop-shadow-2xl opacity-95"
                  priority
                />
              </div>
            </>
          ) : (
            <LibraryView />
          )}
        </div>
      </div>
    </div>
  </section>

  {/* --- HOW IT WORKS --- */}
        <section className="py-8 relative overflow-hidden">
          <div className="text-center mb-4">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-[0.3em]">Trusted Signal: Compatible with 2.5M+ Feeds</span>
          </div>
          
          {/* Wall of Content with Radial Mask */}
          <div className="w-full relative overflow-hidden" style={{ maskImage: 'radial-gradient(ellipse 80% 100% at 50% 50%, black 40%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 100% at 50% 50%, black 40%, transparent 80%)' }}>
            {/* Row 1 - Slow Left */}
            <div className="flex items-center overflow-hidden -mb-4">
              <div className="flex animate-marquee-row-1 gap-4">
                {[...Array(3)].map((_, setIndex) => (
                  <div key={setIndex} className="flex gap-4 shrink-0">
                    {[
                      { name: "Huberman Lab", image: "/huberman.webp" },
                      { name: "Lex Fridman", image: "/Lex.webp" },
                      { name: "Joe Rogan", image: "/joerogan.webp" },
                      { name: "Diary of a CEO", image: "/DOAC.webp" },
                      { name: "Tim Ferriss", image: "/Tim.webp" },
                      { name: "Theo Von", image: "/theo.webp" },
                      { name: "Call Her Daddy", image: "/daddy.webp" },
                      { name: "Masters of Scale", image: "/masters.webp" },
                    ].map((podcast, i) => (
                      <div 
                        key={`r1-${setIndex}-${i}`} 
                        className="w-36 h-36 md:w-40 md:h-40 shrink-0 rounded-2xl overflow-hidden grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer"
                      >
                        <img src={podcast.image} alt={podcast.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Row 2 - Fast Right - Offset */}
            <div className="flex items-center overflow-hidden -mb-4 ml-20">
              <div className="flex animate-marquee-row-2 gap-4">
                {[...Array(3)].map((_, setIndex) => (
                  <div key={setIndex} className="flex gap-4 shrink-0">
                    {[
                      { name: "The Futur", image: "/thefutur.webp" },
                      { name: "My First Million", image: "/first million.webp" },
                      { name: "How I Built This", image: "/howibuilt.webp" },
                      { name: "Science Vs", image: "/sciencevs.webp" },
                      { name: "99% Invisible", image: "/99%.webp" },
                      { name: "Naval", image: "/Naval.webp" },
                      { name: "Conan", image: "/conan.webp" },
                      { name: "Impact Theory", image: "/impact.webp" },
                    ].map((podcast, i) => (
                      <div 
                        key={`r2-${setIndex}-${i}`} 
                        className="w-36 h-36 md:w-40 md:h-40 shrink-0 rounded-2xl overflow-hidden grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer"
                      >
                        <img src={podcast.image} alt={podcast.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Row 3 - Slow Left - Offset */}
            <div className="flex items-center overflow-hidden ml-10">
              <div className="flex animate-marquee-row-3 gap-4">
                {[...Array(3)].map((_, setIndex) => (
                  <div key={setIndex} className="flex gap-4 shrink-0">
                    {[
                      { name: "Smartless", image: "/smartless.webp" },
                      { name: "The Daily", image: "/daily.webp" },
                      { name: "Business Wars", image: "/businesswars.webp" },
                      { name: "All-In", image: "/all-in.webp" },
                      { name: "HBR IdeaCast", image: "/ideacast.webp" },
                      { name: "Smartless", image: "/smartless.webp" },
                      { name: "The Daily", image: "/daily.webp" },
                      { name: "Business Wars", image: "/businesswars.webp" },
                    ].map((podcast, i) => (
                      <div 
                        key={`r3-${setIndex}-${i}`} 
                        className="w-36 h-36 md:w-40 md:h-40 shrink-0 rounded-2xl overflow-hidden grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer"
                      >
                        <img src={podcast.image} alt={podcast.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- LIVE ENGINE INTERACTIVE DEMO --- */}
        <section className="py-16 relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="relative">
              {/* Deep Glass Dashboard with Film Grain */}
              <div className="bg-black/40 backdrop-blur-[60px] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl shadow-black/50 relative overflow-hidden">
                {/* Film Grain Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  }}
                />
                
                {/* Window Controls */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Audia Live Engine v2.4</div>
                </div>
                
                {/* Live Distillation Grid */}
                <div className="grid grid-cols-12 gap-6 relative z-10">
                  {/* Animated Transcript */}
                  <div className="col-span-12 lg:col-span-7 bg-black/30 rounded-2xl p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-orange-500">
                        <FileText size={16} />
                        <span className="text-xs font-semibold uppercase tracking-wider">Live Transcript</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-emerald-400 animate-pulse">● Processing</span>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm text-orange-100/60 font-mono">
                      <p className="animate-pulse">[00:00:15] Sam Altman: The timeline for AGI is compressing...</p>
                      <p className="opacity-70">[00:00:42] Sam Altman: GPT-5 represents a massive leap in reasoning...</p>
                      <p className="opacity-50">[00:01:15] Sam Altman: Sora's physics understanding is emergent...</p>
                      <p className="text-orange-500 text-xs mt-4">[AI Distilling... 2.3M tokens analyzed]</p>
                    </div>
                  </div>
                  
                  {/* Key Insights with Glow */}
                  <div className="col-span-12 lg:col-span-5 space-y-4">
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-5 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                      <div className="flex items-center gap-2 mb-2 text-orange-400 text-xs font-semibold uppercase">
                        <Star size={14} /> Key Insight
                      </div>
                      <p className="text-white text-sm">GPT-5 expected to be massive leap in raw reasoning capabilities</p>
                    </div>
                    <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-2 text-orange-400/70 text-xs font-semibold uppercase">
                        <Star size={14} /> Key Insight
                      </div>
                      <p className="text-white/70 text-sm">Sora's physics understanding is an emergent property of scale</p>
                    </div>
                    <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-2 text-orange-400/70 text-xs font-semibold uppercase">
                        <Star size={14} /> Key Insight
                      </div>
                      <p className="text-white/70 text-sm">AGI timeline compressing but compute/energy are bottlenecks</p>
                    </div>
                  </div>
                </div>
                
                {/* Interactive Audio Bar */}
                <div className="mt-6 flex items-center gap-4 bg-black/40 rounded-xl p-4 border border-white/5 relative z-10">
                  <button 
                    onClick={() => setSoundOn(!soundOn)}
                    className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    {soundOn ? <Pause size={18} fill="black" className="text-black" /> : <Play size={18} fill="black" className="text-black ml-0.5" />}
                  </button>
                  <div className="flex-1">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-300 ${voiceProcessing ? 'animate-pulse w-3/4' : 'w-1/3'}`}></div>
                    </div>
                    <div className="flex justify-between text-xs text-orange-100/40 mt-1 font-mono">
                      <span>0:00</span>
                      <span>{selectedVoice === 'maya' ? 'Maya - Smooth' : 'Caleb - Deep'}</span>
                      <span>4:12</span>
                    </div>
                  </div>
                  
                  {/* Voice Selector */}
                  <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                    <button 
                      onClick={() => { setSelectedVoice('maya'); setVoiceProcessing(true); setTimeout(() => setVoiceProcessing(false), 1500); }}
                      className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${selectedVoice === 'maya' ? 'bg-orange-500/20 text-orange-400' : 'text-zinc-400 hover:text-white'}`}
                    >
                      Maya
                    </button>
                    <button 
                      onClick={() => { setSelectedVoice('caleb'); setVoiceProcessing(true); setTimeout(() => setVoiceProcessing(false), 1500); }}
                      className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${selectedVoice === 'caleb' ? 'bg-orange-500/20 text-orange-400' : 'text-zinc-400 hover:text-white'}`}
                    >
                      Caleb
                    </button>
                  </div>
                  
                  {/* Sound Toggle */}
                  <button 
                    onClick={() => setSoundOn(!soundOn)}
                    className={`p-2 rounded-lg transition-all ${soundOn ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-zinc-400 hover:text-white'}`}
                  >
                    <Speaker size={16} />
                  </button>
                </div>
              </div>
              
            </div>
          </div>
        </section>

        {/* --- COMPARISON SECTION --- */}
        <section className="py-16 relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-white">From Hours to Minutes</h2>
              <p className="text-orange-100/60">See the dramatic difference Audia makes</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Before: 3 Hour Waveform */}
              <div className="p-8 rounded-[2.5rem] bg-black/40 backdrop-blur-[45px] border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                  <svg className="w-full h-full" preserveAspectRatio="none">
                    <pattern id="dense-waveform" x="0" y="0" width="4" height="100%" patternUnits="userSpaceOnUse">
                      <rect x="0" y="20%" width="2" height="60%" fill="#333" rx="1"/>
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#dense-waveform)"/>
                  </svg>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-red-500/60 rounded-full"></div>
                    <span className="text-red-400/80 text-sm font-medium">Original</span>
                  </div>
                  <div className="text-4xl font-bold text-white/40 mb-2 font-mono tracking-tighter">3 hours</div>
                  <p className="text-white/30 text-sm">Dense, unfiltered audio. Filler content. Ads. Digressions.</p>
                </div>
              </div>

              {/* After: 5 Minute Bento */}
              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-orange-500/20 to-amber-500/10 backdrop-blur-[45px] border border-orange-500/30 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full" preserveAspectRatio="none">
                    <pattern id="clean-waveform" x="0" y="0" width="20" height="100%" patternUnits="userSpaceOnUse">
                      <rect x="0" y="35%" width="12" height="30%" fill="#f97316" rx="2"/>
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#clean-waveform)"/>
                  </svg>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-emerald-400 text-sm font-medium">Audia Brief</span>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2 font-mono tracking-tighter">5 minutes</div>
                  <p className="text-orange-100/70 text-sm">Pure signal. Key insights. Structured takeaways. Ready to act.</p>
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs text-emerald-400 font-medium font-mono">
                  36x faster
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- WHY PEOPLE CONVERT SECTION --- */}
        <section id="features" className="py-16 relative">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">Why People Convert</h2>
              <p className="text-orange-100/60 text-lg max-w-2xl mx-auto">
                Three simple steps to transform how you consume audio content.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search any episode */}
              <div className="p-8 md:p-10 rounded-[2.5rem] bg-white/5 backdrop-blur-[45px] border border-white/10 hover:border-orange-500/30 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/10 transition-all group">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                  <Search size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Search any episode</h3>
                <p className="text-orange-100/70 leading-relaxed mb-4">
                  Paste any podcast URL from Spotify, Apple Podcasts, or YouTube. We support 2.5M+ shows.
                </p>
                <div className="flex items-center gap-2 text-orange-400 text-sm font-medium font-mono">
                  <Check size={16} />
                  <span>Universal search</span>
                </div>
              </div>

              {/* Get a distilled brief */}
              <div className="p-8 md:p-10 rounded-[2.5rem] bg-white/5 backdrop-blur-[45px] border border-white/10 hover:border-orange-500/30 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/10 transition-all group">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                  <Sparkles size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Get a distilled brief</h3>
                <p className="text-orange-100/70 leading-relaxed mb-4">
                  Our AI extracts key insights and creates a structured briefing in under 60 seconds.
                </p>
                <div className="flex items-center gap-2 text-orange-400 text-sm font-medium">
                  <Check size={16} />
                  <span>AI-powered distillation</span>
                </div>
              </div>

              {/* Find moments that matter */}
              <div className="p-8 md:p-10 rounded-[2.5rem] bg-white/5 backdrop-blur-[45px] border border-white/10 hover:border-orange-500/30 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/10 transition-all group">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                  <Zap size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Find moments that matter</h3>
                <p className="text-orange-100/70 leading-relaxed mb-4">
                  Jump to timestamped moments or listen to an AI-generated audio briefing on the go.
                </p>
                <div className="flex items-center gap-2 text-orange-400 text-sm font-medium">
                  <Check size={16} />
                  <span>Instant navigation</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- LIVE PULSE TICKER - Social Proof Closer --- */}
        <div className="w-full bg-black/30 backdrop-blur-md border-y border-white/5 py-3 overflow-hidden z-20 relative my-8">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...liveSummaries, ...liveSummaries, ...liveSummaries].map((item, i) => (
              <span key={i} className="mx-8 text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                <span className="text-orange-100/60">Recently Distilled:</span>
                <span className="text-white font-medium">{item.podcast}</span>
                <span className="text-orange-400 font-mono tracking-tight">... Saved {item.saved}</span>
                <Activity size={14} className="text-orange-500 ml-1" />
              </span>
            ))}
          </div>
        </div>

        {/* --- PRICING SECTION --- */}
        <section id="pricing" className="py-24 relative">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">Simple, transparent pricing</h2>
              <p className="text-orange-100/60 text-lg max-w-2xl mx-auto">Start distilling knowledge for free. Upgrade when you need the power of AI voice.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              
              {/* Free Tier - Deep Glass */}
              <div className="p-10 rounded-[2.5rem] bg-white/5 backdrop-blur-[45px] border border-white/10 flex flex-col h-full">
                <div className="text-orange-500 font-bold tracking-widest uppercase text-xs mb-4">Starter</div>
                <div className="text-5xl font-bold mb-4 font-mono tracking-tighter">$0<span className="text-lg text-orange-100/50 font-normal font-sans">/mo</span></div>
                <p className="text-orange-100/60 mb-8 text-sm">Perfect for trying out the Bento Brief format.</p>
                <div className="flex-1 flex flex-col gap-4 mb-8">
                  <div className="flex items-center gap-3 text-sm"><Check size={16} className="text-orange-500"/> 1 Summary per week</div>
                  <div className="flex items-center gap-3 text-sm"><Check size={16} className="text-orange-500"/> Text-only Bento layouts</div>
                  <div className="flex items-center gap-3 text-sm"><Check size={16} className="text-orange-500"/> Web app access</div>
                </div>
                <button className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/10 transition-all font-semibold text-white border border-white/5">Start Free</button>
              </div>

              {/* Pro Tier (Highlighted) - Deep Glass */}
              <div className="p-10 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-[45px] border border-orange-500/50 flex flex-col h-full transform md:-translate-y-4 shadow-[0_0_40px_rgba(249,115,22,0.15)] relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-orange-500/30">Popular</div>
                <div className="text-orange-400 font-bold tracking-widest uppercase text-xs mb-4 flex items-center gap-2"><Sparkles size={14}/> Pro</div>
                <div className="text-5xl font-bold mb-4 text-white font-mono tracking-tighter">$4.99<span className="text-lg text-orange-100/50 font-normal font-sans">/mo</span></div>
                <p className="text-orange-100/60 mb-8 text-sm">The sweet spot for daily commuters and builders.</p>
                <div className="flex-1 flex flex-col gap-4 mb-8">
                  <div className="flex items-center gap-3 text-sm"><Check size={16} className="text-orange-500"/> 5 Summaries per month</div>
                  <div className="flex items-center gap-3 text-sm"><Check size={16} className="text-orange-500"/> AI Voice Generation (Fish Model)</div>
                  <div className="flex items-center gap-3 text-sm"><Check size={16} className="text-orange-500"/> Export to Notion / Obsidian</div>
                  <div className="flex items-center gap-3 text-sm"><Check size={16} className="text-orange-500"/> Mobile PWA integration</div>
                </div>
                <button className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-600 hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/40 transition-all font-semibold text-white shadow-lg shadow-orange-500/25">Upgrade to Pro</button>
              </div>

              {/* Elite Tier - Deep Glass */}
              <div className="p-10 rounded-[2.5rem] bg-white/5 backdrop-blur-[45px] border border-white/10 flex flex-col h-full">
                <div className="text-orange-500 font-bold tracking-widest uppercase text-xs mb-4">Elite</div>
                <div className="text-5xl font-bold mb-4 font-mono tracking-tighter">$9.99<span className="text-lg text-orange-100/50 font-normal font-sans">/mo</span></div>
                <p className="text-orange-100/60 mb-8 text-sm">For power users who need infinite signal.</p>
                <div className="flex-1 flex flex-col gap-4 mb-8">
                  <div className="flex items-center gap-3 text-sm"><Check size={16} className="text-orange-500"/> Unlimited Summaries</div>
                  <div className="flex items-center gap-3 text-sm"><Check size={16} className="text-orange-500"/> Custom AI Voice Clones</div>
                  <div className="flex items-center gap-3 text-sm"><Check size={16} className="text-orange-500"/> Priority iMac Server Queue</div>
                </div>
                <button className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/10 transition-all font-semibold text-white border border-white/5">Get Elite</button>
              </div>

            </div>
          </div>
        </section>

        {/* --- MOBILE BOTTOM DOCK --- */}
        <div className="fixed bottom-6 left-6 right-6 md:hidden z-50">
          <div className="bg-white/5 backdrop-blur-[45px] border border-white/10 rounded-3xl p-3 flex items-center justify-around shadow-2xl shadow-black/50">
            <Link href="/" className="dock-icon flex flex-col items-center gap-1.5 p-3 rounded-2xl hover:bg-white/10 transition-colors min-w-[64px]">
              <Search size={22} className="text-orange-500" />
              <span className="text-[11px] font-medium text-orange-100/80">Search</span>
            </Link>
            <div className="w-px h-10 bg-white/10"></div>
            <Link href="/help" className="dock-icon flex flex-col items-center gap-1.5 p-3 rounded-2xl hover:bg-white/10 transition-colors min-w-[64px]">
              <HelpCircle size={22} className="text-orange-100/70" />
              <span className="text-[11px] font-medium text-orange-100/80">Help</span>
            </Link>
            <div className="w-px h-10 bg-white/10"></div>
            <Link href="/signup" className="dock-icon flex flex-col items-center gap-1.5 p-3 rounded-2xl hover:bg-white/10 transition-colors min-w-[64px]">
              <User size={22} className="text-orange-100/70" />
              <span className="text-[11px] font-medium text-orange-100/80">Account</span>
            </Link>
          </div>
        </div>

        {/* --- HOW IT WORKS --- */}
        <section id="features" className="py-32 bg-black relative">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                From raw audio to refined intelligence in seconds.
              </h2>
            </div>
            
            {/* Steps Grid with connecting line */}
            <div className="relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                {/* Step 1 */}
                <div className="text-center relative">
                  <div className="w-12 h-12 bg-white/[0.05] border border-white/10 rounded-xl flex items-center justify-center mx-auto mb-6 relative z-10">
                    <LinkIcon size={20} className="text-orange-400" />
                  </div>
                  <div className="text-xs text-orange-500 font-semibold uppercase tracking-wider mb-2">Step 1</div>
                  <h3 className="text-xl font-semibold text-white mb-3">Drop the Source</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Paste any Apple Podcast, Spotify, or YouTube URL. Audia bypasses the download and instantly connects to the feed.
                  </p>
                </div>
                
                {/* Step 2 */}
                <div className="text-center relative">
                  <div className="w-12 h-12 bg-white/[0.05] border border-white/10 rounded-xl flex items-center justify-center mx-auto mb-6 relative z-10">
                    <Activity size={20} className="text-orange-400" />
                  </div>
                  <div className="text-xs text-orange-500 font-semibold uppercase tracking-wider mb-2">Step 2</div>
                  <h3 className="text-xl font-semibold text-white mb-3">Neural Processing</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Our engine cleans the audio, identifies multiple speakers, and extracts context with near-perfect accuracy.
                  </p>
                </div>
                
                {/* Step 3 */}
                <div className="text-center relative">
                  <div className="w-12 h-12 bg-white/[0.05] border border-white/10 rounded-xl flex items-center justify-center mx-auto mb-6 relative z-10">
                    <Sparkles size={20} className="text-orange-400" />
                  </div>
                  <div className="text-xs text-orange-500 font-semibold uppercase tracking-wider mb-2">Step 3</div>
                  <h3 className="text-xl font-semibold text-white mb-3">Listen to the Signal</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Hit play. Audia generates a highly produced, 5-minute neural audio brief of your episode, complete with a text transcript and timestamped citations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- FEATURES BENTO GRID --- */}
        <section className="py-32 bg-black relative">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Engineered for deep research.
              </h2>
            </div>
            
            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
              
              {/* Card 1 - Wide (Audio-First Intelligence) */}
              <div className="md:col-span-2 bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-orange-500/20 border border-orange-500/30 rounded-lg flex items-center justify-center">
                    <Headphones size={20} className="text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Audio-First Intelligence</h3>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  You listen to podcasts. Why read summaries? Audia generates ultra-realistic, podcast-quality audio briefs so you can absorb hours of insight during your 15-minute commute.
                </p>
                {/* Audio Waveform Visual */}
                <div className="flex items-center gap-1 h-8">
                  {[40, 70, 50, 90, 60, 80, 45, 75, 55, 85, 40, 70, 50, 90, 60, 80, 45, 75, 55, 85].map((h, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-gradient-to-t from-orange-500 to-orange-300 rounded-full"
                      style={{ height: `${h}%`, opacity: 0.7 + (i % 3) * 0.1 }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Card 2 - Square (Private RSS Feed) */}
              <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-6">
                <div className="w-10 h-10 bg-orange-500/20 border border-orange-500/30 rounded-lg flex items-center justify-center mb-4">
                  <Speaker size={20} className="text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">Private RSS Feed</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Send your audio briefs directly to Apple Podcasts or Spotify. Your own private feed of pure signal.
                </p>
              </div>
              
              {/* Card 3 - Square (Export) */}
              <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-6">
                <div className="w-10 h-10 bg-orange-500/20 border border-orange-500/30 rounded-lg flex items-center justify-center mb-4">
                  <Download size={20} className="text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">Export Anywhere</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Push your briefs directly to Notion, Obsidian, or Markdown with a single click. Your knowledge graph, supercharged.
                </p>
              </div>
              
              {/* Card 4 - Wide (Speaker Diarization) */}
              <div className="md:col-span-2 lg:col-span-2 bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-orange-500/20 border border-orange-500/30 rounded-lg flex items-center justify-center">
                    <Users size={20} className="text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Speaker Diarization</h3>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  Audia instinctively knows who is speaking, isolating hosts from guests so your transcripts read like a script, not a wall of text.
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                    <span className="text-xs text-zinc-400">Host</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600"></div>
                    <span className="text-xs text-zinc-400">Guest 1</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600"></div>
                    <span className="text-xs text-zinc-400">Guest 2</span>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </section>

        {/* --- PRICING --- */}
        <section id="pricing" className="py-32 bg-black relative">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Predictable pricing. Infinite leverage.
              </h2>
              
              {/* Toggle */}
              <div className="inline-flex items-center gap-3 p-1 bg-white/5 border border-white/10 rounded-full mt-8">
                <button className="px-4 py-2 bg-white/10 rounded-full text-sm text-white font-medium">Monthly</button>
                <button className="px-4 py-2 rounded-full text-sm text-zinc-400 hover:text-white transition-colors">
                  Annual <span className="text-orange-400">(Save 20%)</span>
                </button>
              </div>
            </div>
            
            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Free */}
              <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                <div className="text-sm text-zinc-400 uppercase tracking-wider mb-2">Free</div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-zinc-500">/mo</span>
                </div>
                <p className="text-zinc-400 text-sm mb-8">Perfect for dipping your toes.</p>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check size={16} className="text-orange-400" />
                    2 hours of audio processing/mo
                  </li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check size={16} className="text-orange-400" />
                    Text-only bento-briefs
                  </li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check size={16} className="text-orange-400" />
                    Web dashboard access
                  </li>
                </ul>
                
                <button className="w-full py-3 border border-white/20 rounded-full text-white font-medium hover:bg-white/5 transition-all">
                  Get Started
                </button>
              </div>
              
              {/* Pro - Highlighted */}
              <div className="bg-[#FF6600]/10 backdrop-blur-sm border-2 border-[#FF6600]/50 rounded-3xl p-8 relative shadow-[0_0_40px_rgba(255,102,0,0.15)]">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-xs font-semibold text-white">
                  Most Popular
                </div>
                <div className="text-sm text-zinc-400 uppercase tracking-wider mb-2">Pro</div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-white">$4.99</span>
                  <span className="text-zinc-500">/mo</span>
                </div>
                <p className="text-zinc-400 text-sm mb-8">The commuter's command center.</p>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check size={16} className="text-orange-400" />
                    15 hours of audio processing/mo
                  </li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check size={16} className="text-orange-400" />
                    Neural Audio Briefs (Listen anywhere)
                  </li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check size={16} className="text-orange-400" />
                    Automated Email Delivery
                  </li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check size={16} className="text-orange-400" />
                    Notion Export
                  </li>
                </ul>
                
                <button 
                  onClick={() => router.push("/signup")}
                  className="w-full py-3 bg-white rounded-full text-black font-semibold hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  START 7-DAY FREE TRIAL
                </button>
              </div>
              
              {/* Max */}
              <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                <div className="text-sm text-zinc-400 uppercase tracking-wider mb-2">Max</div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-white">$9.99</span>
                  <span className="text-zinc-500">/mo</span>
                </div>
                <p className="text-zinc-400 text-sm mb-8">For extreme knowledge synthesis.</p>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check size={16} className="text-orange-400" />
                    50 hours of audio processing/mo
                  </li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check size={16} className="text-orange-400" />
                    Private RSS Feed integration
                  </li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check size={16} className="text-orange-400" />
                    Multilingual audio generation
                  </li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check size={16} className="text-orange-400" />
                    Full API access
                  </li>
                </ul>
                
                <button className="w-full py-3 border border-white/20 rounded-full text-white font-medium hover:bg-white/5 transition-all">
                  Upgrade to Max
                </button>
              </div>
              
            </div>
          </div>
        </section>

        {/* --- FAQ --- */}
        <section id="faq" className="py-32 bg-black relative">
          <div className="max-w-3xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Frequently asked questions.
              </h2>
            </div>
            
            {/* FAQ Items */}
            <div className="space-y-0">
              <FAQItem 
                question="Does it work with YouTube videos?"
                answer="Yes. Just paste the YouTube URL. Audia extracts the audio layer and processes the transcript instantly."
              />
              <FAQItem 
                question="How long does a 2-hour podcast take to summarize?"
                answer="Typically under 3 minutes. Our priority GPU tier processes audio at roughly 40x real-time speed."
              />
              <FAQItem 
                question="Can I upload my own local audio files?"
                answer="Absolutely. We support direct uploads for .mp3, .wav, and .m4a files up to 2GB."
              />
              <FAQItem 
                question="What if the podcast has multiple guests?"
                answer="Our engine automatically detects and tags different speakers so you always know who made which point."
              />
            </div>
          </div>
        </section>

        {/* --- PRE-FOOTER CTA --- */}
        <section className="bg-white/[0.02] border-y border-white/10 py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-orange-200 to-orange-400 bg-clip-text text-transparent">
              Ready to find the signal?
            </h2>
            <p className="text-zinc-400 mb-8">
              Join 50,000+ users distilling hours into minutes.
            </p>
            <button 
              onClick={() => router.push("/signup")}
              className="px-10 py-4 bg-black/60 backdrop-blur-2xl border border-[#FF6600]/60 text-white font-semibold rounded-full hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,102,0,0.3)]"
            >
              START 7-DAY FREE TRIAL
            </button>
          </div>
        </section>

        {/* --- GLOBAL FOOTER --- */}
        <footer className="bg-black/40 backdrop-blur-[60px] border-t border-white/10 pt-20 pb-10">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            
            {/* Footer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              
              {/* Column 1: Brand Identity */}
              <div className="md:col-span-1">
                <div className="text-2xl font-bold tracking-tight mb-3 text-white font-mono">Audia.</div>
                <p className="text-zinc-500 text-sm mb-6">The neural engine for audio intelligence.</p>
                
                {/* Social Icons */}
                <div className="flex gap-3">
                  <a href="https://twitter.com/audia" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href="https://linkedin.com/company/audia" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                  <a href="https://github.com/audia" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </a>
                </div>
              </div>
              
              {/* Column 2: Product */}
              <div>
                <div className="font-bold text-xs uppercase tracking-widest text-orange-500 mb-4">Product</div>
                <nav className="flex flex-col gap-3">
                  <Link href="/pricing" className="text-zinc-400 hover:text-white transition-colors text-sm">Pricing</Link>
                  <Link href="/features" className="text-zinc-400 hover:text-white transition-colors text-sm">Features</Link>
                  <Link href="/use-cases" className="text-zinc-400 hover:text-white transition-colors text-sm">Use Cases</Link>
                  <Link href="/changelog" className="text-zinc-400 hover:text-white transition-colors text-sm">Changelog</Link>
                </nav>
              </div>
              
              {/* Column 3: Resources */}
              <div>
                <div className="font-bold text-xs uppercase tracking-widest text-orange-500 mb-4">Resources</div>
                <nav className="flex flex-col gap-3">
                  <Link href="/help" className="text-zinc-400 hover:text-white transition-colors text-sm">Help Center</Link>
                  <Link href="/docs" className="text-zinc-400 hover:text-white transition-colors text-sm">API Docs</Link>
                  <Link href="/blog" className="text-zinc-400 hover:text-white transition-colors text-sm">Blog</Link>
                  <a href="mailto:support@audia.com" className="text-zinc-400 hover:text-white transition-colors text-sm">Contact Support</a>
                </nav>
              </div>
              
              {/* Column 4: Legal */}
              <div>
                <div className="font-bold text-xs uppercase tracking-widest text-orange-500 mb-4">Legal</div>
                <nav className="flex flex-col gap-3">
                  <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors text-sm">Privacy Policy</Link>
                  <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors text-sm">Terms of Service</Link>
                  <Link href="/cookies" className="text-zinc-400 hover:text-white transition-colors text-sm">Cookie Policy</Link>
                  <Link href="/security" className="text-zinc-400 hover:text-white transition-colors text-sm">Security</Link>
                </nav>
              </div>
            </div>
            
            {/* Copyright Bar */}
            <div className="border-t border-white/10 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-zinc-600 text-xs">
                  © 2026 Audia Technologies Inc. All rights reserved.
                </div>
                <a href="/status" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-xs">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  All systems operational
                </a>
              </div>
            </div>
            
          </div>
        </footer>

      </div>
    </main>
  );
}