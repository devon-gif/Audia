"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/app/components/AuthCard";
import OAuthButtons from "@/app/components/OAuthButtons";
import Divider from "@/app/components/Divider";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { supabase } from "@/utils/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { trial_ends_at: trialEndsAt },
      },
    });

    setIsSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }

    // Email confirmation is ON — no session yet, ask user to verify
    if (!data.session) {
      setNeedsEmailConfirm(true);
      return;
    }

    // Session exists — hard-navigate so cookies are sent on the first request
    setSuccess(true);
    await supabase.auth.getSession();
    router.refresh();
    setTimeout(() => { window.location.href = "/dashboard"; }, 1200);
  };

  return (
    <AuthCard 
      title="Create your account" 
      subtitle="Start your 7-day free trial today"
    >
      {/* OAuth Buttons */}
      <OAuthButtons />
      
      {/* Divider */}
      <Divider />
      
      {/* Email Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-xs text-zinc-400 uppercase tracking-wider">Work Email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@company.com"
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
              required
            />
          </div>
        </div>
        
        {/* Password Input */}
        <div className="space-y-2">
          <label className="text-xs text-zinc-400 uppercase tracking-wider">Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Create a secure password"
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        
        {/* Email confirmation notice */}
        {needsEmailConfirm && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-1">Check your inbox</p>
            <p className="text-xs text-zinc-400">A confirmation link has been sent to <span className="text-white">{formData.email}</span>. Click it to activate your account.</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-xs text-red-400 text-center -mb-2">{error}</p>
        )}

        {/* Submit Button - Filament CTA */}
        <button
          type="submit"
          disabled={isSubmitting || success || needsEmailConfirm}
          className={`w-full mt-6 px-6 py-4 backdrop-blur-2xl border text-white font-semibold rounded-full transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
            success
              ? "bg-emerald-500/20 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
              : "bg-black/60 border-[#FF6600]/60 hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(255,102,0,0.3)]"
          }`}
        >
          <span className="font-mono tracking-widest uppercase text-sm">
            {success ? "SUCCESS! REDIRECTING..." : isSubmitting ? "CREATING ACCOUNT..." : "START 7-DAY FREE TRIAL"}
          </span>
          {success ? (
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : isSubmitting ? (
            <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          ) : (
            <ArrowRight size={18} />
          )}
        </button>
      </form>
      
      {/* Terms Text */}
      <p className="mt-6 text-center text-xs text-zinc-500">
        By signing up, you agree to our{" "}
        <Link href="/terms" className="text-orange-400 hover:text-orange-300 transition-colors">Terms</Link>
        {" "}and{" "}
        <Link href="/privacy" className="text-orange-400 hover:text-orange-300 transition-colors">Privacy Policy</Link>
      </p>
      
      {/* Login Link */}
      <p className="mt-6 text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
