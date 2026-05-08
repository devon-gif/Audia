/**
 * POST /api/subscription/apply-discount
 *
 * Applies a promotional discount coupon to an existing Stripe subscription.
 * Used for churn prevention offers.
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

// Initialize Supabase with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Coupon IDs from environment variables
const COUPON_MAP = {
  pro: process.env.PRO_DISCOUNT_ID,
  elite: process.env.ELITE_DISCOUNT_ID,
};

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { subscriptionId, tier } = body;

    if (!subscriptionId || !tier) {
      return NextResponse.json(
        { error: "Missing subscriptionId or tier" },
        { status: 400 }
      );
    }

    if (tier !== "pro" && tier !== "elite") {
      return NextResponse.json(
        { error: "Invalid tier. Must be 'pro' or 'elite'" },
        { status: 400 }
      );
    }

    // Get coupon ID from env
    const couponId = COUPON_MAP[tier as keyof typeof COUPON_MAP];
    if (!couponId) {
      return NextResponse.json(
        { error: `Discount coupon not configured for ${tier} tier` },
        { status: 500 }
      );
    }

    // Apply coupon to subscription
    // Note: in the 2026-04-22 Stripe API the legacy top-level `coupon` field
    // was replaced by `discounts: [{ coupon }]`.
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      discounts: [{ coupon: couponId }],
      metadata: {
        discountApplied: "true",
        discountTier: tier,
        discountDate: new Date().toISOString(),
      },
    });

    console.log(`[apply-discount] Applied ${couponId} to subscription ${subscriptionId} for user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: "Offer applied! Your next 6 months are on us.",
      subscriptionId: subscription.id,
      status: subscription.status,
    });
  } catch (error) {
    console.error("[apply-discount] Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to apply discount", details: message },
      { status: 500 }
    );
  }
}
