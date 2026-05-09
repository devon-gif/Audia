/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout session for subscription purchases.
 */

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(req: Request) {
  try {
    // 0. Validate Stripe key is present
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe Secret Key is missing in environment variables.");
    }

    const body = await req.json();
    const { tier, priceId: explicitPriceId, userEmail, userId: bodyUserId } = body;

    // 1. Resolve price ID — prefer server-side tier mapping over client-supplied priceId
    const TIER_PRICE_MAP: Record<string, string | undefined> = {
      starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY,
      pro:     process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY,
      max:     process.env.NEXT_PUBLIC_STRIPE_ELITE_MONTHLY,
    };

    const priceId = tier ? TIER_PRICE_MAP[tier] : explicitPriceId;

    if (!priceId) {
      const msg = tier
        ? `Missing Stripe Price ID for tier "${tier}". Add the env var to .env.local and restart.`
        : "Missing priceId — pass a valid tier ('starter', 'pro', 'max') or explicit priceId.";
      console.error("[STRIPE ERROR]", msg);
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // 2. Resolve authenticated user so we can attach client_reference_id
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value: "", ...options });
          },
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
