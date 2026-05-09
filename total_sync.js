const fs = require('fs');

// 1. FIX THE SYNTAX & LENGTH: app/api/summarize/route.ts
const apiPath = 'app/api/summarize/route.ts';
const apiContent = `import { AssemblyAI } from 'assemblyai';
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const aai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { url, length } = await req.json();
    
    let wordTarget, depthMode;
    if (length === "3m") {
      wordTarget = 500;
      depthMode = "a concise executive summary.";
    } else if (length === "5m") {
      wordTarget = 950;
      depthMode = "a detailed narrative covering all primary arguments.";
    } else {
      wordTarget = 2000;
      depthMode = "a massive, immersive narrative masterpiece. You must unfold the story slowly, recounting specific dialogues and nuances. This is a 10-minute read—do not skip details.";
    }

    const transcript = await aai.transcripts.transcribe({ 
      audio: url, 
      speech_models: ["universal-3-pro"] 
    });
    
    if (!transcript.text) throw new Error("No transcript found.");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: \`You are an elite narrator. Create a 'Deep Signal Brief' that is purely narrative. \${depthMode} Target \${wordTarget} words. No bullets.\` },
        { role: "user", content: \`Summarize: \${transcript.text}\` }
      ],
    });

    const brief = response.choices[0].message.content;
    return NextResponse.json({ brief, summary: brief, transcriptLength: transcript.text.length });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}`;
fs.writeFileSync(apiPath, apiContent);

// 2. FIX AUDIO CHUNKING: app/api/summarize/audio/route.ts
const audioPath = 'app/api/summarize/audio/route.ts';
const audioContent = `import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { text, voice } = await req.json();
    const chunks = [];
    for (let i = 0; i < text.length; i += 3800) {
      chunks.push(text.slice(i, i + 3800));
    }
    const buffers = await Promise.all(chunks.map(async (chunk) => {
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice || "onyx",
        input: chunk,
      });
      return Buffer.from(await mp3.arrayBuffer());
    }));
    const finalBuffer = Buffer.concat(buffers);
    return new NextResponse(finalBuffer, { headers: { 'Content-Type': 'audio/mpeg' } });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}`;
fs.writeFileSync(audioPath, audioContent);

// 3. FIX PLAYER HOOKS: app/components/dashboard/GlobalPlayer.tsx
const playerPath = 'app/components/dashboard/GlobalPlayer.tsx';
const playerContent = \`"use client";
import { useEffect, useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Headphones, X } from "lucide-react";

export default function StereoPlayer() {
  const [mounted, setMounted] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const { load, isPlaying, progress, duration, toggle, seek, skip, volume, setVolume, dismiss, track } = usePlayer();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;
  if (!track) return null;

  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    return \`\${m}:\${String(Math.floor(s % 60)).padStart(2, "0")}\`;
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative w-full bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/50">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-0.5">Deep Signal Brief</p>
            <p className="text-xs font-semibold text-white truncate">{track.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => toggle()} className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-all">
              {isPlaying ? <Pause size={18} className="text-black" /> : <Play size={18} className="text-black ml-0.5" />}
            </button>
            <button onClick={() => dismiss()} className="p-2 text-zinc-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-[10px] font-mono text-zinc-500">{formatTime(progress)}</span>
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer group" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            seek((e.clientX - rect.left) / rect.width * duration);
          }}>
            <div className="h-full bg-orange-500 transition-all" style={{ width: \`\${pct}%\` }} />
          </div>
          <span className="text-[10px] font-mono text-zinc-500">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}\`;
fs.writeFileSync(playerPath, playerContent);
console.log('✅ All systems synced. Errors purged. Audio chunking active!');
