import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { voice } = await req.json();
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice.toLowerCase(),
      input: `Hi! I am ${voice}. I will be your narrator for this podcast brief.`,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    return new NextResponse(buffer, { headers: { 'Content-Type': 'audio/mpeg' } });
  } catch (error) {
    return NextResponse.json({ error: "Preview failed" }, { status: 500 });
  }
}
