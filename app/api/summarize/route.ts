import { AssemblyAI } from 'assemblyai';
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const aai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY || '' });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { url, length } = await req.json();
    const wordTarget = length === '10m' ? 2200 : length === '5m' ? 950 : length === '3m' ? 500 : 150;
    const depth = length === '10m' ? 'a massive narrative masterpiece' : length === '1m' ? 'a rapid-fire, ultra-concise executive summary designed for a 60-second read' : 'a detailed narrative';

    const transcript = await aai.transcripts.transcribe({ 
      audio: url, 
      speech_models: ['universal-3-pro'] 
    });
    
    if (!transcript.text) throw new Error('No transcript found.');

    let brief: string | null;

    if (length === '10m') {
      // Split transcript at the nearest sentence boundary to the midpoint
      const mid = Math.floor(transcript.text.length / 2);
      const periodIndex = transcript.text.indexOf('.', mid);
      const splitAt = periodIndex !== -1 ? periodIndex + 1 : mid;
      const part1 = transcript.text.slice(0, splitAt).trim();
      const part2 = transcript.text.slice(splitAt).trim();

      const [res1, res2] = await Promise.all([
        openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are an elite narrator. Create Part 1 of a narrative Deep Signal Brief. Target 1100 words. No bullets.' },
            { role: 'user', content: part1 },
          ],
        }),
        openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are an elite narrator. Create Part 2 of a narrative Deep Signal Brief. Target 1100 words. No bullets.' },
            { role: 'user', content: part2 },
          ],
        }),
      ]);

      brief = `${res1.choices[0].message.content}\n\n${res2.choices[0].message.content}`;
    } else {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `You are an elite narrator. Create a narrative Deep Signal Brief (${depth}). Target ${wordTarget} words. No bullets.` },
          { role: 'user', content: transcript.text },
        ],
      });
      brief = response.choices[0].message.content;
    }

    return NextResponse.json({ brief, summary: brief, transcriptLength: transcript.text.length });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}