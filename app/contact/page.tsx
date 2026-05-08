"use client";

import { useState } from "react";
import { 
  ArrowLeft, Mail, MessageSquare, User, Send, CheckCircle,
  AlertCircle, Shield, Sparkles, Server
} from "lucide-react";
import Link from "next/link";

const subjects = [
  "General Inquiry",
  "Billing & Subscription",
  "Technical Support",
  "Feature Request",
  "Bug Report",
  "Partnership"
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

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
            <Link href="/help" className="text-sm text-orange-100/60 hover:text-white transition-colors hidden md:block">Help</Link>
            <Link href="/contact" className="text-sm text-white hover:text-orange-200 transition-colors hidden md:block">Contact</Link>
            <button className="px-5 py-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-xs text-white uppercase tracking-widest hover:bg-white/20 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20 transition-all">
              Login
            </button>
          </div>
        </nav>

        {/* Header */}
        <header className="max-w-4xl mx-auto px-6 md:px-12 pt-12 pb-12 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-orange-100/60 hover:text-white transition-colors text-sm mb-8"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white via-orange-100 to-orange-500/50 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-lg text-orange-100/60 max-w-2xl mx-auto leading-relaxed">
            Have questions or feedback? We are here to help. Reach out directly or use the form below.
          </p>
        </header>

        {/* Server Status Indicator */}
        <div className="max-w-md mx-auto px-6 mb-12">
          <div className="flex items-center justify-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-[45px] border border-white/10 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-sm text-orange-100/70">AI Processing Node</span>
            <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
              <Server size={14} />
              Online
            </span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 md:px-12 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="p-8 md:p-10 rounded-[2.5rem] bg-white/5 backdrop-blur-[45px] border border-white/10">
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={40} className="text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Message Sent!</h3>
                    <p className="text-orange-100/70 mb-8 max-w-sm mx-auto">
                      Thank you! Your message has been sent. We will get back to you shortly.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl transition-all text-sm font-semibold"
                      >
                        <ArrowLeft size={14} />
                        Return Home
                      </Link>
                      <button
                        onClick={() => {
                          setIsSubmitted(false);
                          setFormData({ name: "", email: "", subject: "", message: "" });
                        }}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium"
                      >
                        Send Another Message
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-orange-100/70 mb-2">
                          <User size={14} className="inline mr-2" />
                          Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Your name"
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-orange-500/50 transition-colors"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-orange-100/70 mb-2">
                          <Mail size={14} className="inline mr-2" />
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="you@example.com"
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-orange-500/50 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Subject Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-orange-100/70 mb-2">
                        <MessageSquare size={14} className="inline mr-2" />
                        Subject
                      </label>
                      <select
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500/50 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="bg-[#1a1a1a]">Select a subject...</option>
                        {subjects.map((subject) => (
                          <option key={subject} value={subject} className="bg-[#1a1a1a]">{subject}</option>
                        ))}
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-orange-100/70 mb-2">
                        <MessageSquare size={14} className="inline mr-2" />
                        Message
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us how we can help..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-orange-500/50 transition-colors resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/40 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Side Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Direct Email CTA */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 backdrop-blur-[45px] border border-orange-500/30">
                <Sparkles size={24} className="text-orange-500 mb-3" />
                <h3 className="text-lg font-bold mb-2">Prefer Email?</h3>
                <p className="text-sm text-orange-100/70 mb-4">
                  Reach our support team directly for faster response on urgent issues.
                </p>
                <a
                  href="mailto:support@audia.io"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all hover:scale-[1.02]"
                >
                  <Mail size={16} />
                  support@audia.io
                </a>
              </div>

              {/* Response Time */}
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-[45px] border border-white/10">
                <h3 className="text-lg font-bold mb-4">What to Expect</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3 text-orange-100/70">
                    <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Response within 24 hours</span>
                  </li>
                  <li className="flex items-start gap-3 text-orange-100/70">
                    <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Priority support for Pro & Elite</span>
                  </li>
                  <li className="flex items-start gap-3 text-orange-100/70">
                    <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Detailed troubleshooting guides</span>
                  </li>
                </ul>
              </div>

              {/* Security Note */}
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-[45px] border border-white/10">
                <div className="flex items-start gap-3">
                  <Shield size={20} className="text-orange-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Privacy First</h4>
                    <p className="text-sm text-orange-100/60">
                      Your message is encrypted and stored locally. We never share your contact information with third parties.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
