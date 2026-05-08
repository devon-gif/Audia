/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout session for subscription purchases.
 */

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { priceId, userEmail, userId: bodyUserId } = body;

    // 1. Check for Missing Price ID
    if (!priceId) {
      console.error(
        "[STRIPE ERROR] Missing priceId. Check if your NEXT_PUBLIC_STRIPE_ variables are loaded."
      );
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    // 2. Resolve authenticated user so we can attach client_reference_id
    const cookieStore = await cookies();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();

    // 3. Check for Missing Site URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    console.log(`[STRIPE LOG] Creating checkout for Price: ${priceId}`);
    console.log("FINAL PRICE ID RECEIVED:", priceId);

    // 4. Create the Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/dashboard?success=true`,
      cancel_url: `${siteUrl}/dashboard/billing`,
      customer_email: user?.email || userEmail || undefined,
      // Prefer server-verified user ID; fall back to client-supplied ID
      client_reference_id: user?.id || bodyUserId || undefined,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[STRIPE CRITICAL ERROR]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
