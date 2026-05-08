/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout session for subscription purchases.
 */

import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { priceId, userEmail } = body;

    // 1. Check for Missing Price ID
    if (!priceId) {
      console.error(
        "[STRIPE ERROR] Missing priceId. Check if your NEXT_PUBLIC_STRIPE_ variables are loaded."
      );
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    // 2. Check for Missing Site URL
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    console.log(`[STRIPE LOG] Creating checkout for Price: ${priceId}`);

    // 3. Create the Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/dashboard?success=true`,
      cancel_url: `${siteUrl}/dashboard`,
      customer_email: userEmail || undefined,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    // THIS IS THE CRITICAL LOG
    console.error("[STRIPE CRITICAL ERROR]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
