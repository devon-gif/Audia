import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { transcriptText } = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert podcast analyst. Create a 'Deep Signal Brief' that is concise, narrative, and engaging. No bullet points. Max 400 words. Focus on the core insights and profound takeaways."
      },
      {
        role: "user",
        content: `Summarize this: ${transcriptText}`
      }
    ],
  });

  return NextResponse.json({ brief: response.choices[0].message.content, summary: response.choices[0].message.content });
}
