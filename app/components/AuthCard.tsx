"use client";

import { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Glass Card */}
      <div className="bg-white/[0.03] backdrop-blur-[80px] border border-white/10 rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-2xl font-bold tracking-tight mb-2 text-white font-mono">Audia<span className="text-[#FF6600]">.</span></div>
          <h1 className="text-xl font-semibold text-white mb-1">{title}</h1>
          {subtitle && (
            <p className="text-sm text-zinc-400">{subtitle}</p>
          )}
        </div>
        
        {/* Content */}
        {children}
        
      </div>
    </div>
  );
}
