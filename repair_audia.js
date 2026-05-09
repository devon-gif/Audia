const fs = require('fs');

// 1. REPAIR SUMMARIZE API (Fixed Syntax & Length Logic)
const apiPath = 'app/api/summarize/route.ts';
const apiContent = `import { AssemblyAI } from 'assemblyai';
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const aai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { url, length } = await req.json();
    let wordTarget = length === "10m" ? 2200 : (length === "5m" ? 950 : 500);
    let depth = length === "10m" ? "a massive, five-part narrative masterpiece" : "a detailed narrative";

    const transcript = await aai.transcripts.transcribe({ 
      audio: url, 
      speech_models: ["universal-3-pro"] 
    });
    
    if (!transcript.text) throw new Error("No transcript found.");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: \`You are an elite narrator. Create a narrative 'Deep Signal Brief' (\${depth}). Target \${wordTarget} words. No bullets.\` },
        { role: "user", content: transcript.text }
      ],
    });

    const brief = response.choices[0].message.content;
    return NextResponse.json({ brief, summary: brief, transcriptLength: transcript.text.length });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}`;
fs.writeFileSync(apiPath, apiContent);

// 2. REPAIR GLOBAL PLAYER (Clean Hooks)
const playerPath = 'app/components/dashboard/GlobalPlayer.tsx';
const playerContent = \`"use client";
import { useEffect, useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { Play, Pause, X } from "lucide-react";

export default function StereoPlayer() {
  const [mounted, setMounted] = useState(false);
  const { isPlaying, progress, duration, toggle, dismiss, track } = usePlayer();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !track) return null;

  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    return \`\${m}:\${String(Math.floor(s % 60)).padStart(2, "0")}\`;
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4">
      <div className="relative w-full bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Deep Signal Brief</p>
            <p className="text-xs font-semibold text-white truncate">{track.title}</p>
          </div>
          <button onClick={toggle} className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-all">
            {isPlaying ? <Pause size={18} className="text-black" /> : <Play size={18} className="text-black ml-0.5" />}
          </button>
          <button onClick={dismiss} className="p-2 text-zinc-500 hover:text-white">
            <X size={16} />
          </button>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-[10px] font-mono text-zinc-500">{formatTime(progress)}</span>
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 transition-all" style={{ width: \`\${pct}%\` }} />
          </div>
          <span className="text-[10px] font-mono text-zinc-500">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}\`;
fs.writeFileSync(playerPath, playerContent);
console.log('✅ API and Player files repaired!');
