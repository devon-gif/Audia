import { AssemblyAI } from 'assemblyai';
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const aai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    
    const { url, length } = await req.json();
    
    let wordTarget = 450;
    let depthInstructions = "Focus on a high-level executive summary.";
    
    if (length === "5m") {
      wordTarget = 800;
      depthInstructions = "Provide a detailed narrative covering all major themes and arguments.";
    } else if (length === "10m") {
      wordTarget = 1500;
      depthInstructions = "Provide an exhaustive, deep-dive narrative. Capture the nuances, the flow of the conversation, and detailed examples shared by the speakers.";
    }

    console.log(`🚀 Generating ${length} brief (~ ${wordTarget} words) for:`, url);
    
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
          content: `You are an elite podcast narrator. Create a 'Deep Signal Brief' that is purely narrative and highly engaging. ${depthInstructions} Target length is approximately ${wordTarget} words. Do not use bullet points or headers.` 
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
