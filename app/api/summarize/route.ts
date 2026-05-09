import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    console.log("1. 🚀 Request received for:", url);

    // This is where we simulate the transcript fetch
    // If you are using AssemblyAI, ensure that logic is here.
    // For now, let's ensure we aren't passing 'undefined'
    const transcriptText = "This is a placeholder transcript. If you see this, the transcript fetch logic is missing.";
    
    console.log("2. 📝 Transcript Length:", transcriptText?.length);

    if (!transcriptText || transcriptText === "undefined") {
      throw new Error("Transcript is empty or undefined. Check AssemblyAI keys.");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Summarize this podcast transcript in a narrative style." },
        { role: "user", content: transcriptText }
      ],
    });

    const brief = response.choices[0].message.content;
    console.log("3. ✅ Summary Generated!");

    return NextResponse.json({ 
      brief: brief, 
      summary: brief, 
      transcriptLength: transcriptText.length 
    });

  } catch (err) {
    console.error("❌ API ERROR:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
