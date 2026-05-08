import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: 'Authentication | Audia',
  description: 'Sign in to Audia - Your AI curator for long-form audio',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500/30 overflow-x-hidden relative flex items-center justify-center">
      {/* Subtle Deep Orange Radial Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-orange-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Floating headphones — ambient backdrop */}
      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[520px] h-[520px] opacity-[0.07] animate-float">
          <Image
            src="/headphones.png"
            alt=""
            width={520}
            height={520}
            className="w-full h-full object-contain"
            priority
          />
        </div>
      </div>

      {/* Back to home button */}
      <div className="fixed top-6 left-6 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-sm text-zinc-400 hover:text-white hover:bg-white/10 transition-all group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-mono tracking-wide text-xs uppercase">Home</span>
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-6">
        {children}
      </div>
    </div>
  );
}

