import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Server, Database, UserCheck, Trash2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Audia",
  description: "How Audia collects, uses, and protects your data. We don\u2019t sell your data or use it to train AI models.",
};

const sections = [
  {
    icon: Shield,
    title: "1. Our Commitment to Privacy",
    body: [
      "At Audia, we believe your personal data and listening habits belong to you alone. We collect only what is strictly necessary to provide the Service and we never sell, rent, or trade your information to third parties for marketing purposes.",
      "This Privacy Policy explains what data we collect, why we collect it, how we use it, and the rights you have over it. It applies to all users of audia.app and our mobile PWA.",
    ],
  },
  {
    icon: Database,
    title: "2. Data We Collect",
    body: [
      "Account data: When you register, we collect your email address and a hashed password (via Supabase Auth). We do not store plain-text passwords.",
      "Usage data: We log the URLs and RSS feeds you submit for summarisation, the brief length you select, and the voice preference you choose. This is used solely to generate your summaries and populate your Library.",
      "Billing data: Payment information is handled entirely by Stripe. Audia never sees or stores your card number, CVC, or bank details. We store only a Stripe Customer ID and subscription status.",
      "Device & analytics data: We may collect anonymised device type, browser, and general location (country-level) for product analytics. This data cannot be used to identify you individually.",
    ],
  },
  {
    icon: Eye,
    title: "3. How We Use Your Data",
    body: [
      "To provide and improve the Service: Your submitted URLs are processed to generate AI summaries. Generated summaries and audio files are stored in your Library for up to 90 days.",
      "To communicate with you: We may send transactional emails (receipts, subscription alerts, security notices). You can opt out of marketing emails at any time.",
      "To prevent fraud and abuse: Usage patterns may be analysed to detect abuse of our API rate limits or Terms of Service violations.",
    ],
  },
  {
    icon: Server,
    title: "4. Third-Party Services",
    body: [
      "We use the following sub-processors to deliver the Service. Each operates under a Data Processing Agreement (DPA) with us:",
      "\u2022 AssemblyAI \u2014 Audio transcription. Your audio URL is passed to AssemblyAI's API; the resulting transcript is processed ephemerally and is not stored by us beyond the summary generation step. AssemblyAI does not use customer data to train its models.",
      "\u2022 OpenAI \u2014 Summary generation via GPT-4o. Transcript text is sent to OpenAI's API. OpenAI does not use API customer data to train its models (per OpenAI\u2019s API Data Usage Policy).",
      "\u2022 Supabase \u2014 Authentication and database hosting. Your account data, library, and usage records are stored in a Supabase Postgres instance in the EU-West-1 (Ireland) AWS region.",
      "\u2022 Stripe \u2014 Payment processing. All billing data is handled by Stripe under PCI-DSS compliance.",
    ],
  },
  {
    icon: Lock,
    title: "5. Data Security",
    body: [
      "All data in transit is encrypted using TLS 1.2+. Data at rest in Supabase is encrypted using AES-256. Access to production systems is restricted to authorised personnel only and protected by multi-factor authentication.",
      "While we implement industry-standard security measures, no system is perfectly secure. We encourage you to use a strong, unique password for your Audia account.",
    ],
  },
  {
    icon: UserCheck,
    title: "6. Your Rights",
    body: [
      "Depending on your jurisdiction, you may have the following rights:",
      "\u2022 Right of Access: Request a copy of the personal data we hold about you.",
      "\u2022 Right to Rectification: Ask us to correct inaccurate data.",
      "\u2022 Right to Erasure: Request deletion of your account and all associated data.",
      "\u2022 Right to Portability: Receive your library data in a structured, machine-readable format.",
      "\u2022 Right to Object: Opt out of any future processing we do beyond strict service delivery.",
      "To exercise any of these rights, email privacy@audia.app. We will respond within 30 days.",
    ],
  },
  {
    icon: Trash2,
    title: "7. Data Retention",
    body: [
      "Active accounts: Library entries (summaries and audio files) are retained for 90 days after generation, then automatically deleted.",
      "Closed accounts: When you delete your account, all personal data is purged within 30 days, except where we are required to retain it by law (e.g., billing records for 7 years under tax regulations).",
      "Aggregated analytics data (anonymised) may be retained indefinitely for product improvement purposes.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <nav className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-medium transition-colors">
          <ArrowLeft size={15} />
          Back to Home
        </Link>
        <span className="text-[11px] font-bold tracking-widest uppercase text-zinc-600">Audia \u00b7 Legal</span>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Shield size={16} className="text-orange-400" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-orange-400/80">Legal</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">Privacy Policy</h1>
          <p className="text-zinc-500 text-sm">Last updated: May 9, 2026 \u00b7 Applies to all Audia services.</p>
        </div>

        <div className="space-y-10">
          {sections.map(({ icon: Icon, title, body }) => (
            <div key={title} className="border-b border-white/5 pb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-zinc-400" />
                </div>
                <h2 className="text-white font-semibold text-base">{title}</h2>
              </div>
              <div className="space-y-3 pl-10">
                {body.map((para, i) => (
                  <p key={i} className="text-zinc-400 text-sm leading-relaxed">{para}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-2">Privacy enquiries</h3>
          <p className="text-zinc-500 text-sm mb-4">To exercise your rights or ask about our data practices, contact our privacy team.</p>
          <a href="mailto:privacy@audia.app" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#FF7A00] to-[#E05A00] rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity">
            privacy@audia.app
          </a>
        </div>

        <div className="mt-6 flex gap-4 text-sm">
          <Link href="/terms" className="text-zinc-500 hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/dmca" className="text-zinc-500 hover:text-white transition-colors">DMCA Policy</Link>
          <Link href="/opt-out" className="text-zinc-500 hover:text-white transition-colors">Creator Opt-Out</Link>
        </div>
      </main>
    </div>
  );
}


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
