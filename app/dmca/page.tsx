import Link from "next/link";
import { ArrowLeft, ShieldAlert, FileWarning, Mail, ListOrdered, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Copyright & DMCA Policy | Audia",
  description:
    "Audia's DMCA policy and copyright takedown process. We respect intellectual property rights and respond promptly to valid notices.",
};

const noticeRequirements = [
  {
    step: "01",
    title: "Your identity",
    description:
      "Your full legal name, physical address, telephone number, and email address. If you are acting on behalf of a rights holder, include the name of the organisation and a statement of your authority to act on their behalf.",
  },
  {
    step: "02",
    title: "Identification of the copyrighted work",
    description:
      "A clear description of the copyrighted work you claim has been infringed. If multiple works are covered by a single notice, provide a representative list.",
  },
  {
    step: "03",
    title: "Identification of the infringing material",
    description:
      "The specific URL(s) or other identifying information pointing to the material on Audia that you claim is infringing. General allegations without specific URLs cannot be actioned.",
  },
  {
    step: "04",
    title: "Statement of good faith",
    description:
      "A statement that you have a good faith belief that the use of the material in the manner complained of is not authorised by the copyright owner, its agent, or the law.",
  },
  {
    step: "05",
    title: "Statement of accuracy",
    description:
      "A statement, under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or are authorised to act on behalf of the copyright owner.",
  },
  {
    step: "06",
    title: "Electronic or physical signature",
    description:
      "Your physical or electronic signature. Typing your full legal name at the bottom of the email constitutes an electronic signature for this purpose.",
  },
];

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
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

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <ShieldAlert size={16} className="text-red-400" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-red-400/80">
              Legal · Copyright
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">
            Copyright &amp; DMCA Policy
          </h1>
          <p className="text-zinc-500 text-sm">
            Last updated: May 9, 2026 · In compliance with the Digital Millennium Copyright Act (17 U.S.C. § 512).
          </p>
        </div>

        {/* Our commitment */}
        <div className="border-b border-white/5 pb-10 mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <CheckCircle size={14} className="text-zinc-400" />
            </div>
            <h2 className="text-white font-semibold text-base">Our Commitment to Intellectual Property</h2>
          </div>
          <div className="space-y-3 pl-10">
            <p className="text-zinc-400 text-sm leading-relaxed">
              Audia respects the intellectual property rights of all content creators. We are committed to
              complying with the Digital Millennium Copyright Act (DMCA) and responding promptly and appropriately
              to valid takedown notices.
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Audia generates transformative, educational summaries of publicly accessible audio content. We do not
              host, stream, or redistribute original audio files. We believe our summarisation process constitutes
              Fair Use under 17 U.S.C. § 107. Nevertheless, we take copyright claims seriously and maintain a
              clear process for rights holders to contact us.
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Repeat infringers will have their accounts terminated in appropriate circumstances.
            </p>
          </div>
        </div>

        {/* How to file */}
        <div className="border-b border-white/5 pb-10 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <ListOrdered size={14} className="text-zinc-400" />
            </div>
            <h2 className="text-white font-semibold text-base">How to Submit a Takedown Notice</h2>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8 pl-10">
            To file a valid DMCA takedown notice, your written communication must include <strong className="text-white">all</strong> of the
            following elements. Incomplete notices cannot be actioned. Send your notice to{" "}
            <a href="mailto:legal@audia.app" className="text-orange-400 hover:text-orange-300 transition-colors">
              legal@audia.app
            </a>
            .
          </p>

          <div className="space-y-5">
            {noticeRequirements.map(({ step, title, description }) => (
              <div
                key={step}
                className="flex gap-5 bg-white/[0.02] border border-white/8 rounded-xl p-5"
              >
                <div className="text-3xl font-extrabold text-white/5 font-mono leading-none shrink-0 w-10">
                  {step}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1.5">{title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Counter-notification */}
        <div className="border-b border-white/5 pb-10 mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <FileWarning size={14} className="text-zinc-400" />
            </div>
            <h2 className="text-white font-semibold text-base">Counter-Notification</h2>
          </div>
          <div className="space-y-3 pl-10">
            <p className="text-zinc-400 text-sm leading-relaxed">
              If you believe your content was removed as a result of a mistake or misidentification, you may submit a
              counter-notification. A valid counter-notification must include: (a) your physical or electronic
              signature; (b) identification of the removed material and its location before removal; (c) a statement
              under penalty of perjury that you have a good faith belief the material was removed by mistake or
              misidentification; and (d) your name, address, telephone number, and consent to the jurisdiction of
              the Federal District Court for your district.
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Send counter-notifications to{" "}
              <a href="mailto:legal@audia.app" className="text-orange-400 hover:text-orange-300 transition-colors">
                legal@audia.app
              </a>{" "}
              with the subject line <span className="font-mono text-zinc-300">&ldquo;DMCA Counter-Notification&rdquo;</span>.
            </p>
          </div>
        </div>

        {/* Warning about false notices */}
        <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-6 mb-10">
          <h3 className="text-red-400 font-semibold text-sm mb-2">⚠ Warning: False DMCA Notices</h3>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Under 17 U.S.C. § 512(f), any person who knowingly materially misrepresents that material is infringing,
            or that material was removed by mistake or misidentification, may be subject to liability for damages,
            costs, and attorneys&apos; fees. Please only submit a DMCA notice if you are the rights holder or are
            authorised to act on their behalf.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Mail size={16} className="text-orange-400" />
            <h3 className="text-white font-semibold">Send a Takedown Notice</h3>
          </div>
          <p className="text-zinc-500 text-sm mb-4">
            All DMCA notices, counter-notifications, and legal correspondence should be directed to our designated
            DMCA agent.
          </p>
          <a
            href="mailto:legal@audia.app?subject=DMCA%20Takedown%20Notice"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#FF7A00] to-[#E05A00] rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Mail size={14} />
            Email legal@audia.app
          </a>
        </div>

        <div className="mt-8 flex gap-4 text-sm">
          <Link href="/terms" className="text-zinc-500 hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="text-zinc-500 hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/opt-out" className="text-zinc-500 hover:text-white transition-colors">Creator Opt-Out</Link>
        </div>
      </main>
    </div>
  );
}
