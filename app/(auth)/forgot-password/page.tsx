"use client";

import { useState } from "react";
import Link from "next/link";
import AuthCard from "@/app/components/AuthCard";
import { Mail, ArrowLeft, ArrowRight, Check } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSent(true);
  };

  if (isSent) {
    return (
      <AuthCard 
        title="Check your email" 
        subtitle="We've sent you a password reset link"
      >
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-orange-500/20 border border-orange-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-orange-400" />
          </div>
          <p className="text-sm text-zinc-400 mb-6">
            We sent a reset link to <span className="text-white">{email}</span>
          </p>
          <p className="text-xs text-zinc-500 mb-8">
            Didn&apos;t receive it? Check your spam folder or{" "}
            <button 
              onClick={() => setIsSent(false)}
              className="text-orange-400 hover:text-orange-300 transition-colors"
            >
              try again
            </button>
          </p>
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard 
      title="Reset password" 
      subtitle="Enter your email to receive a reset link"
    >
      {/* Back Link */}
      <Link 
        href="/login" 
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to login
      </Link>
      
      {/* Email Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-xs text-zinc-400 uppercase tracking-wider">Work Email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
              required
            />
          </div>
        </div>
        
        {/* Submit Button - Filament CTA */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-6 px-6 py-4 bg-black/60 backdrop-blur-2xl border border-[#FF6600]/60 text-white font-semibold rounded-full hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(255,102,0,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="font-mono tracking-widest uppercase text-sm">
            {isSubmitting ? "SENDING..." : "SEND RESET LINK"}
          </span>
          {!isSubmitting && <ArrowRight size={18} />}
        </button>
      </form>
      
      {/* Help Text */}
      <p className="mt-6 text-center text-xs text-zinc-500">
        Remember your password?{" "}
        <Link href="/login" className="text-orange-400 hover:text-orange-300 transition-colors">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
