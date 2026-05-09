import { AssemblyAI } from 'assemblyai';
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const aai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { url, voiceId } = await req.json();
    console.log("🚀 Starting deep signal analysis for:", url);

    // 1. Transcription - This 'transcribe' method waits for completion
    const transcript = await aai.transcripts.transcribe({ audio: url, speech_models: ["universal-3-pro"], speech_models: ["universal-3-pro"], speech_models: ["universal-3-pro"] });
    
    if (!transcript.text) {
      throw new Error("Transcription completed but returned no text.");
    }

    console.log("✅ Transcript captured. Length:", transcript.text.length);

    // 2. Summarization
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a professional podcast narrator. Create a 'Deep Signal Brief' that is narrative, high-level, and engaging. Avoid bullet points. Max 400 words." 
        },
        { role: "user", content: `Summarize this transcript: ${transcript.text}` }
      ],
    });

    const briefContent = response.choices[0].message.content;

    // 3. Return both keys to satisfy the Dashboard UI
    return NextResponse.json({ brief: briefContent, summary: briefContent, transcriptLength: transcript.text.length });

  } catch (err) {
    console.error("❌ API ERROR:", err.message);
    return NextResponse.json({ brief: briefContent, summary: briefContent, transcriptLength: transcript.text.length });
  }
}
