import { AssemblyAI } from 'assemblyai';
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
      depthMode = "a concise executive summary focusing only on the 3 biggest 'signals'.";
    } else if (length === "5m") {
      wordTarget = 900;
      depthMode = "a detailed narrative that captures the flow of the conversation and all primary arguments.";
    } else {
      // 10m Mode - The "Deep Signal Masterpiece"
      wordTarget = 2200; // Aiming high to ensure 10+ minutes
      depthMode = "a massive, five-part narrative masterpiece. You must recount the podcast chronologically. Act 1: The Setup (400 words), Act 2: The Core Arguments (500 words), Act 3: The Deep Dive (500 words), Act 4: The Counterpoints (400 words), Act 5: The Conclusion (400 words). Use slow, descriptive prose." You must expand on every anecdote, recount specific dialogues in a storytelling fashion, and capture the host's nuances. This is a 10-minute read—do not skip the small details. Unfold the story slowly.";
    }

    console.log(`🎙️ Force-feeding ${length} target (${wordTarget} words) to the engine...`);
    
    
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
          content: `You are a world-class long-form narrator. Your goal is to produce a 'Deep Signal Brief' that reads like a high-end magazine feature. For this request, you must provide ${depthMode} You are strictly required to write approximately ${wordTarget} words. If you are too brief, the production fails. Use vivid descriptions and conversational transitions. No headers, no bullets—just pure, flowing narrative.` 
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
