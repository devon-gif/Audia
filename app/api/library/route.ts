import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// ─── GET /api/library ─────────────────────────────────────────────────────────
// Returns the authenticated user's completed audio generations, newest first.

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("audio_generations")
    .select("id, source_url, summary_text, brief_audio_url, voice, created_at, brief_length")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .not("summary_text", "is", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[library] fetch error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}
