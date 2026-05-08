import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// ─── POST /api/contact ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  let body: { email?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, message } = body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }
  if (!message || typeof message !== "string" || message.trim().length < 10) {
    return NextResponse.json({ error: "Message must be at least 10 characters." }, { status: 400 });
  }

  try {
    await resend.emails.send({
      // Must be a verified Resend sender domain. Update once domain is verified.
      from: "Audia Support <support@audia.ai>",
      // Strictly hardcoded — all support messages route to the owner inbox
      to: "heydevon@gmail.com",
      replyTo: email,
      subject: `Audia Support Request from ${email}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
          <div style="background: #FF6600; padding: 24px 32px; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; color: white; font-size: 18px; font-weight: 800; letter-spacing: -0.5px;">
              Audia — New Support Request
            </h1>
          </div>
          <div style="background: #fafafa; border: 1px solid #eee; border-top: none; padding: 32px; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">
              From
            </p>
            <p style="margin: 0 0 24px; font-size: 15px; color: #111;">
              <a href="mailto:${email}" style="color: #FF6600; text-decoration: none;">${email}</a>
            </p>
            <p style="margin: 0 0 8px; font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">
              Message
            </p>
            <div style="background: white; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px 20px;">
              <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.7; white-space: pre-wrap;">${message.trim()}</p>
            </div>
            <p style="margin: 24px 0 0; font-size: 12px; color: #aaa;">
              Reply directly to this email to respond to ${email}.
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact] Resend error:", err);
    return NextResponse.json(
      { error: "Failed to send message. Please try again or email devon@audia.ai directly." },
      { status: 502 }
    );
  }
}
