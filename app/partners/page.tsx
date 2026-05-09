import Link from "next/link";
import { ArrowRight, DollarSign, Users, Repeat, BadgeCheck } from "lucide-react";

export const metadata = {
  title: "Partner Program | Audia",
  description:
    "Earn 20% recurring commission by introducing your podcast audience to Audia — the neural engine for audio intelligence.",
};

const earningsTable = [
  { signups: "100", monthly: "$200", annually: "$2,400" },
  { signups: "500", monthly: "$1,000", annually: "$12,000" },
  { signups: "1,000", monthly: "$2,000", annually: "$24,000" },
];

const valueProps = [
  {
    icon: DollarSign,
    title: "Passive Revenue",
    description:
      "Earn 20% recurring commission every month for the full lifetime of each subscriber you refer. No caps, no expiry.",
    accent: "from-emerald-500/20 to-emerald-600/5",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
  },
  {
    icon: Repeat,
    title: "Increased Retention",
    description:
      "Help listeners catch up on your entire back-catalog in minutes. Busy fans stay loyal fans when they can keep up effortlessly.",
    accent: "from-blue-500/20 to-blue-600/5",
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
  },
  {
    icon: BadgeCheck,
    title: "Official Branding",
    description:
      "Verified partner briefs feature your show's artwork, name, and direct links back to your episodes — driving discovery and listens.",
    accent: "from-orange-500/20 to-orange-600/5",
    border: "border-orange-500/20",
    iconColor: "text-orange-400",
    iconBg: "bg-orange-500/10",
  },
];

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 py-5 px-6 md:px-12 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-3 items-center">
          <Link href="/" className="text-2xl font-bold tracking-tight text-white font-mono">
            Audia<span className="text-[#FF6600]">.</span>
          </Link>
          <nav className="hidden md:flex items-center justify-center gap-8">
            <Link href="/#features" className="text-sm text-white/70 hover:text-white transition-colors">Features</Link>
            <Link href="/#pricing" className="text-sm text-white/70 hover:text-white transition-colors">Pricing</Link>
            <Link href="/#how-it-works" className="text-sm text-white/70 hover:text-white transition-colors">How it Works</Link>
            <Link href="/contact" className="text-sm text-white/70 hover:text-white transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center justify-end gap-4">
            <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">Log in</Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 bg-[#FF6600]/10 backdrop-blur-md border border-[#FF6600]/30 rounded-full text-sm text-white/80 font-semibold hover:bg-[#FF6600]/20 hover:text-white hover:border-[#FF6600]/50 transition-all"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden pt-28 pb-24 px-6 md:px-12">
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-500/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-orange-600/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 mb-8">
              <Users size={13} className="text-orange-400" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-orange-400">Partner Program</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
              Turn Your Listeners<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] to-[#FF4400]">
                into Active Learners.
              </span>
            </h1>

            <p className="text-zinc-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
              Earn <span className="text-white font-semibold">20% recurring commission</span> by providing your audience
              with high-fidelity, neural audio summaries of your show.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:partners@audia.app?subject=Partner%20Program%20Application"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FF7A00] to-[#E05A00] rounded-2xl text-white font-bold text-sm shadow-[0_0_30px_rgba(255,120,0,0.3)] hover:shadow-[0_0_50px_rgba(255,120,0,0.45)] hover:scale-[1.02] transition-all"
              >
                Apply for Partner Access
                <ArrowRight size={15} />
              </a>
              <Link
                href="/#pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-zinc-300 hover:text-white font-medium text-sm transition-colors"
              >
                View Plans
              </Link>
            </div>

            {/* Trust strip */}
            <div className="flex items-center justify-center gap-6 mt-12 flex-wrap">
              {["20% Recurring Commission", "No Minimum Payout", "Monthly Transfers", "Dedicated Partner Manager"].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-[12px] text-zinc-500">
                  <span className="w-1 h-1 rounded-full bg-orange-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── VALUE PROPS ── */}
        <section className="py-20 px-6 md:px-12 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[11px] font-bold uppercase tracking-widest text-orange-500 mb-3">Why Partner With Us</p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                Built for creators who value their audience.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {valueProps.map(({ icon: Icon, title, description, accent, border, iconColor, iconBg }) => (
                <div
                  key={title}
                  className={`relative overflow-hidden rounded-2xl border ${border} bg-gradient-to-br ${accent} p-8 flex flex-col gap-5`}
                >
                  <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
                    <Icon size={20} className={iconColor} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── EARNINGS TABLE ── */}
        <section className="py-20 px-6 md:px-12 border-t border-white/5">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[11px] font-bold uppercase tracking-widest text-orange-500 mb-3">The Math</p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">
                Your earning potential.
              </h2>
              <p className="text-zinc-500 text-sm">
                Based on Pro Tier ($9.99/mo) at 20% commission. Numbers grow as your audience scales.
              </p>
            </div>

            {/* Table card */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-3 px-6 py-4 border-b border-white/10 bg-white/[0.02]">
                <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Sign-ups</span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 text-center">Monthly</span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 text-right">Annually</span>
              </div>

              {earningsTable.map(({ signups, monthly, annually }, i) => (
                <div
                  key={signups}
                  className={`grid grid-cols-3 px-6 py-5 items-center ${
                    i !== earningsTable.length - 1 ? "border-b border-white/5" : ""
                  } ${i === earningsTable.length - 1 ? "bg-orange-500/5" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                      i === earningsTable.length - 1
                        ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                        : "bg-white/5 text-zinc-400 border border-white/10"
                    }`}>
                      {i === earningsTable.length - 1 ? "🔥" : i + 1}
                    </div>
                    <span className={`font-semibold text-sm ${i === earningsTable.length - 1 ? "text-white" : "text-zinc-300"}`}>
                      {signups} referrals
                    </span>
                  </div>
                  <span className={`text-center font-bold text-lg ${
                    i === earningsTable.length - 1 ? "text-orange-400" : "text-white"
                  }`}>
                    {monthly}<span className="text-[11px] font-normal text-zinc-500">/mo</span>
                  </span>
                  <span className={`text-right text-sm font-semibold ${
                    i === earningsTable.length - 1 ? "text-orange-300/80" : "text-zinc-400"
                  }`}>
                    {annually}
                  </span>
                </div>
              ))}

              {/* Footer note */}
              <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01]">
                <p className="text-[11px] text-zinc-600">
                  * Commission calculated on Pro Tier at $9.99/mo. Starter and Max tiers generate proportionally different returns.
                  Commission is paid on active, non-refunded subscriptions only.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-20 px-6 md:px-12 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[11px] font-bold uppercase tracking-widest text-orange-500 mb-3">How It Works</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">Up and running in three steps.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Apply", body: "Submit your application with your podcast name, RSS feed, and audience size. We review within 48 hours." },
                { step: "02", title: "Share", body: "Get your unique referral link and co-branded landing page. Drop it in show notes, newsletters, or social." },
                { step: "03", title: "Earn", body: "Every subscriber who signs up through your link earns you 20% for as long as they remain a paying member." },
              ].map(({ step, title, body }) => (
                <div key={step} className="flex flex-col gap-4">
                  <div className="text-5xl font-extrabold text-white/5 font-mono leading-none">{step}</div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="py-20 px-6 md:px-12 border-t border-white/5">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-3xl px-8 py-14">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">
                Ready to grow together?
              </h2>
              <p className="text-zinc-400 mb-8 leading-relaxed">
                Join the Audia Partner Program and start earning passive income while giving your audience a genuinely better listening experience.
              </p>
              <a
                href="mailto:partners@audia.app?subject=Partner%20Program%20Application"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FF7A00] to-[#E05A00] rounded-2xl text-white font-bold text-sm shadow-[0_0_30px_rgba(255,120,0,0.3)] hover:shadow-[0_0_50px_rgba(255,120,0,0.45)] hover:scale-[1.02] transition-all"
              >
                Apply for Partner Access
                <ArrowRight size={15} />
              </a>
              <p className="text-zinc-600 text-xs mt-6">
                Questions? Email us at{" "}
                <a href="mailto:partners@audia.app" className="text-zinc-400 hover:text-white transition-colors">
                  partners@audia.app
                </a>
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-black/40 backdrop-blur-[60px] border-t border-white/10 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="text-2xl font-bold tracking-tight mb-3 text-white font-mono">Audia<span className="text-[#FF6600]">.</span></div>
              <p className="text-zinc-500 text-sm mb-6">The neural engine for audio intelligence.</p>
              <div className="flex gap-3">
                <a href="https://twitter.com/audia" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <a href="https://linkedin.com/company/audia" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
                <a href="https://github.com/audia" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                </a>
              </div>
            </div>
            {/* Product */}
            <div>
              <div className="font-bold text-xs uppercase tracking-widest text-orange-500 mb-4">Product</div>
              <nav className="flex flex-col gap-3">
                <Link href="/#pricing" className="text-zinc-400 hover:text-white transition-colors text-sm">Pricing</Link>
                <Link href="/features" className="text-zinc-400 hover:text-white transition-colors text-sm">Features</Link>
                <Link href="/use-cases" className="text-zinc-400 hover:text-white transition-colors text-sm">Use Cases</Link>
                <Link href="/changelog" className="text-zinc-400 hover:text-white transition-colors text-sm">Changelog</Link>
              </nav>
            </div>
            {/* Resources */}
            <div>
              <div className="font-bold text-xs uppercase tracking-widest text-orange-500 mb-4">Resources</div>
              <nav className="flex flex-col gap-3">
                <Link href="/help" className="text-zinc-400 hover:text-white transition-colors text-sm">Help Center</Link>
                <Link href="/docs" className="text-zinc-400 hover:text-white transition-colors text-sm">API Docs</Link>
                <Link href="/blog" className="text-zinc-400 hover:text-white transition-colors text-sm">Blog</Link>
                <Link href="/partners" className="text-zinc-400 hover:text-white transition-colors text-sm">Partner Program</Link>
                <a href="mailto:support@audia.app" className="text-zinc-400 hover:text-white transition-colors text-sm">Contact Support</a>
              </nav>
            </div>
            {/* Legal */}
            <div>
              <div className="font-bold text-xs uppercase tracking-widest text-orange-500 mb-4">Legal</div>
              <nav className="flex flex-col gap-3">
                <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors text-sm">Privacy Policy</Link>
                <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors text-sm">Terms of Service</Link>
                <Link href="/opt-out" className="text-zinc-400 hover:text-white transition-colors text-sm">Creator Opt-Out</Link>
                <Link href="/cookies" className="text-zinc-400 hover:text-white transition-colors text-sm">Cookie Policy</Link>
                <Link href="/security" className="text-zinc-400 hover:text-white transition-colors text-sm">Security</Link>
              </nav>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-zinc-600 text-xs">© 2026 Audia Technologies Inc. All rights reserved.</div>
              <a href="/status" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-xs">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                All systems operational
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
