"use client";

export default function Divider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/10" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-black px-4 text-xs text-zinc-500 uppercase tracking-wider">or</span>
      </div>
    </div>
  );
}
