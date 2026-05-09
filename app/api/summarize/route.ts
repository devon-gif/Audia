import { AssemblyAI } from "assemblyai";
import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const aai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { url, length } = await req.json();
    
    let wordTarget = 500;
    let depth = "a concise executive summary.";
    
    if (length === "5m") {
      wordTarget = 950;
      depth = "a detailed narrative covering all primary arguments.";
    } else if (length === "10m") {
      wordTarget = 2200;
      depth = "a massive, five-part narrative masterpiece. You must unfold the story slowly and recount specific dialogues.";
    }

    const transcript = await aai.transcripts.transcribe({ 
      audio: url, 
      speech_models: ["universal-3-pro"] 
    });
    
    if (!transcript.text) throw new Error("No transcript found.");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an elite narrator. Create a narrative Deep Signal Brief (" + depth + "). Target " + wordTarget + " words. Use flowing prose, no bullets." 
        },
        { role: "user", content: "Transcript: " + transcript.text }
      ],
    });

    const brief = response.choices[0].message.content;
    return NextResponse.json({ 
      brief, 
      summary: brief, 
      transcriptLength: transcript.text.length 
    });
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}