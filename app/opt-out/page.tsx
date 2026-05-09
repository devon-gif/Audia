import Link from "next/link";
import { ArrowLeft, ShieldCheck, Mail } from "lucide-react";

export const metadata = {
  title: "Creator Opt-Out & DMCA | Audia",
  description:
    "Audia respects creator rights. Podcast creators can request their RSS feed be removed from Audia's AI processing at any time.",
};

export default function OptOutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <Link
          href="/"
          className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-medium transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Home
        </Link>
        <span className="text-[11px] font-bold tracking-widest uppercase text-zinc-600">
          Audia · Legal
        </span>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center px-6 py-20">
        <div className="max-w-2xl w-full">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <ShieldCheck size={16} className="text-orange-400" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-orange-400/80">
              Creator Rights
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">
            Creator Opt-Out &amp; DMCA
          </h1>

          <p className="text-zinc-400 text-base leading-relaxed mb-10">
            Audia is an AI-powered summarization tool that helps listeners get more value from
            podcasts they already follow. Our summaries are transformative, independent works
            created for educational purposes and are protected under the Fair Use doctrine
            (17 U.S.C. § 107). We do not host, redistribute, or monetise original audio
            content.
          </p>

          {/* Divider */}
          <div className="border-t border-white/5 mb-10" />

          {/* Sections */}
          <section className="space-y-8 text-zinc-400 text-sm leading-relaxed">
            <div>
              <h2 className="text-white font-semibold text-base mb-2">Our Commitment to Creators</h2>
              <p>
                We respect the rights of every podcast creator. While we believe our summaries
                fall firmly within Fair Use — they are transformative, non-commercial in nature
                toward creators, and do not substitute for the original work — we offer a
                no-questions-asked opt-out for any podcaster who does not want their public RSS
                feed processed by Audia users.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold text-base mb-2">How the Opt-Out Works</h2>
              <p>
                Once we receive and verify your opt-out request, your RSS feed domain will be
                added to our API blocklist within&nbsp;
                <span className="text-white font-medium">5 business days</span>. Any attempt
                to summarise episodes from your feed will return a clear error message to
                Audia users explaining that the creator has opted out.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold text-base mb-2">DMCA Takedown Requests</h2>
              <p>
                If you believe any content on Audia infringes your copyright, please send a
                formal DMCA takedown notice to the address below. Include your name, the
                infringing content URL, the original content URL, a statement of good faith,
                and your signature.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold text-base mb-2">Contact</h2>
              <p>
                All opt-out requests, DMCA notices, and legal enquiries should be sent to:
              </p>
              <p className="mt-2 font-mono text-orange-400/80">legal@audia.app</p>
            </div>
          </section>

          {/* CTA */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:legal@audia.app?subject=RSS%20Opt-Out%20Request&body=Hi%20Audia%20team%2C%0A%0AI%20am%20the%20creator%2Fowner%20of%20the%20following%20RSS%20feed%20and%20I%20would%20like%20to%20opt%20out%20of%20AI%20processing%3A%0A%0ARSS%20URL%3A%20%0APodcast%20Name%3A%20%0A%0AThank%20you."
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF7A00] to-[#E05A00] rounded-xl text-white font-bold text-sm shadow-[0_0_20px_rgba(255,120,0,0.25)] hover:shadow-[0_0_30px_rgba(255,120,0,0.4)] transition-all"
            >
              <Mail size={15} />
              Request RSS Removal
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-zinc-300 hover:text-white font-medium text-sm transition-colors"
            >
              <ArrowLeft size={15} />
              Back to Home
            </Link>
          </div>

          {/* Footer note */}
          <p className="mt-10 text-[11px] text-zinc-700 leading-relaxed">
            This page does not constitute legal advice. Audia&apos;s Fair Use position is based on
            our good-faith interpretation of 17 U.S.C. § 107. If you have specific legal
            concerns, please consult a qualified attorney.
          </p>
        </div>
      </main>
    </div>
  );
}
