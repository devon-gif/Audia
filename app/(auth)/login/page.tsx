"use client";

import { useState } from "react";
import Link from "next/link";
import AuthCard from "@/app/components/AuthCard";
import OAuthButtons from "@/app/components/OAuthButtons";
import Divider from "@/app/components/Divider";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    // Redirect to dashboard
    window.location.href = "/";
  };

  return (
    <AuthCard 
      title="Welcome back" 
      subtitle="Sign in to continue your journey"
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
              placeholder="Enter your password"
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
              required
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
        
        {/* Submit Button - Filament CTA */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-6 px-6 py-4 bg-black/60 backdrop-blur-2xl border border-[#FF6600]/60 text-white font-semibold rounded-full hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(255,102,0,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="font-mono tracking-widest uppercase text-sm">
            {isSubmitting ? "SIGNING IN..." : "LOG IN"}
          </span>
          {!isSubmitting && <ArrowRight size={18} />}
        </button>
      </form>
      
      {/* Bottom Links */}
      <div className="mt-6 space-y-3 text-center">
        <p className="text-sm text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
            Sign up
          </Link>
        </p>
        <p className="text-sm">
          <Link href="/forgot-password" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            Forgot password?
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
