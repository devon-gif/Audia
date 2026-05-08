"use client";

import { FileText, Scale, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  const sections = [
    {
      icon: CheckCircle,
      title: "Acceptance of Terms",
      content: "By accessing or using Audia (the Service), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service. These terms apply to all users, including visitors, registered users, and subscribers."
    },
    {
      icon: Scale,
      title: "Use License & Restrictions",
      content: "We grant you a limited, non-exclusive, non-transferable license to use Audia for personal, non-commercial purposes. You may not: redistribute summaries for profit, attempt to reverse engineer our AI models, use automated systems to abuse our service, or resell access to your account."
    },
    {
      icon: FileText,
      title: "Content & Copyright",
      content: "Audia provides summaries of third-party content. We do not claim ownership of original podcast materials. Our AI-generated summaries are derivative works intended for personal educational use. Users are responsible for complying with copyright laws in their jurisdiction when sharing or distributing summaries."
    },
    {
      icon: AlertCircle,
      title: "Limitation of Liability",
      content: "Audia is provided as-is without warranties of any kind. We are not liable for: inaccuracies in AI-generated content, service interruptions, data loss, or damages arising from your use of summaries. Our total liability shall not exceed the amount you paid for the Service in the 12 months preceding the claim."
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
          <Scale size={14} />
          Legal
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white via-orange-100 to-orange-500/50 bg-clip-text text-transparent">
          Terms of Service
        </h1>
        <p className="text-lg text-orange-100/60 max-w-2xl mx-auto leading-relaxed">
          The rules of engagement. Please read carefully before using Audia.
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

        {/* Additional Terms */}
        <div className="mt-12 bg-white/5 backdrop-blur-[45px] border border-white/10 rounded-3xl p-8 md:p-10">
          <h3 className="text-lg font-bold mb-6">Additional Provisions</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-white mb-2">Subscription & Billing</h4>
              <p className="text-orange-100/70 text-sm leading-relaxed">
                Paid subscriptions auto-renew monthly unless cancelled. You may cancel anytime through your account settings. 
                Refunds are provided within 14 days of purchase if you are unsatisfied with the service. 
                Price changes will be communicated 30 days in advance.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">Termination</h4>
              <p className="text-orange-100/70 text-sm leading-relaxed">
                We reserve the right to terminate or suspend your account immediately for violations of these terms, 
                fraudulent activity, or behavior that harms other users or the service. Upon termination, 
                your right to use Audia ceases immediately.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">Governing Law</h4>
              <p className="text-orange-100/70 text-sm leading-relaxed">
                These terms shall be governed by the laws of the State of Delaware, United States, 
                without regard to conflict of law provisions. Any disputes shall be resolved through binding 
                arbitration in San Francisco, California.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">Changes to Terms</h4>
              <p className="text-orange-100/70 text-sm leading-relaxed">
                We may update these terms from time to time. We will notify users of significant changes via email 
                or in-app notification. Continued use of Audia after changes constitutes acceptance of the new terms.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-orange-100/50">
            Questions about our terms? Contact us at{" "}
            <a href="mailto:legal@audia.app" className="text-orange-400 hover:text-orange-300 transition-colors">
              legal@audia.app
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
