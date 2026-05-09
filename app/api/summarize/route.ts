import { AssemblyAI } from 'assemblyai';
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const aai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY || '' });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { url, length } = await req.json();
    const wordTarget = length === '10m' ? 2200 : (length === '5m' ? 950 : 500);
    const depth = length === '10m' ? 'a massive narrative masterpiece' : 'a detailed narrative';

    const transcript = await aai.transcripts.transcribe({ 
      audio: url, 
      speech_models: ['universal-3-pro'] 
    });
    
    if (!transcript.text) throw new Error('No transcript found.');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: `You are an elite narrator. Create a narrative Deep Signal Brief (${depth}). Target ${wordTarget} words. No bullets.` },
        { role: 'user', content: transcript.text }
      ],
    });

    const brief = response.choices[0].message.content;
    return NextResponse.json({ brief, summary: brief, transcriptLength: transcript.text.length });
  } catch (err: unknown) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}