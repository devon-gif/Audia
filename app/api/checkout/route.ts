/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout session for subscription purchases.
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceId, userEmail } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing priceId in request body" },
        { status: 400 }
      );
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: "http://localhost:3000/dashboard?success=true",
      cancel_url: "http://localhost:3000/pricing",
      customer_email: userEmail || undefined,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("[checkout] Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session", details: error.message },
      { status: 500 }
    );
  }
}
