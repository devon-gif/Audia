/**
 * POST /api/webhooks/stripe
 *
 * Handles verified Stripe webhook events:
 *  - checkout.session.completed  → upgrade profiles tier + favorite_slots
 *  - customer.subscription.deleted → downgrade profiles tier back to 'free'
 *
 * Set STRIPE_WEBHOOK_SECRET to the signing secret from your Stripe dashboard
 * (Developers → Webhooks → your endpoint → Signing secret).
 */

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRO_PRICE_IDS = new Set([
  process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY,
  process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY,
]);

const ELITE_PRICE_IDS = new Set([
  process.env.NEXT_PUBLIC_STRIPE_ELITE_MONTHLY,
  process.env.NEXT_PUBLIC_STRIPE_ELITE_YEARLY,
]);

const TIER_MAP: Record<string, { tier: string; favorites_slots: number }> = {};
PRO_PRICE_IDS.forEach((id) => { if (id) TIER_MAP[id] = { tier: "pro", favorites_slots: 5 }; });
ELITE_PRICE_IDS.forEach((id) => { if (id) TIER_MAP[id] = { tier: "elite", favorites_slots: 99 }; });

// ─── Stripe + Supabase clients ────────────────────────────────────────────────

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

// Service-role client — bypasses RLS so we can write to profiles
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Webhook handler ──────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const body = await req.text(); // raw body required for signature verification
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("[STRIPE WEBHOOK] Missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[STRIPE WEBHOOK] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("[STRIPE WEBHOOK] Signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`[STRIPE WEBHOOK] Received event: ${event.type} (${event.id})`);

  // ── checkout.session.completed ─────────────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Retrieve full session with line_items expanded so we get the price ID
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["line_items.data.price", "total_details.breakdown.discounts.discount.promotion_code"],
    });

    const userId = fullSession.client_reference_id;
    if (!userId) {
      console.error("[STRIPE WEBHOOK] No client_reference_id on session", session.id);
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Determine tier from the purchased price ID
    const priceId = fullSession.line_items?.data?.[0]?.price?.id;
    const tierData = priceId ? TIER_MAP[priceId] : undefined;

    if (!tierData) {
      console.warn("[STRIPE WEBHOOK] Unknown priceId, skipping tier update:", priceId);
      return NextResponse.json({ received: true });
    }

    console.log(`[STRIPE WEBHOOK] Upgrading user ${userId} to tier=${tierData.tier} slots=${tierData.favorites_slots}`);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        tier: tierData.tier,
        favorites_slots: tierData.favorites_slots,
        stripe_customer_id: fullSession.customer as string ?? null,
        stripe_subscription_id: fullSession.subscription as string ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (profileError) {
      console.error("[STRIPE WEBHOOK] Failed to update profile:", profileError.message);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    // ── Affiliate / promotion code tracking ───────────────────────────────
    try {
      const discounts = (fullSession.total_details as any)?.breakdown?.discounts ?? [];
      for (const d of discounts) {
        const promoCode: string | undefined =
          typeof d.discount?.promotion_code === "object"
            ? d.discount.promotion_code?.code
            : d.discount?.promotion_code;

        if (promoCode) {
          console.log(`[STRIPE WEBHOOK] Promo code used: ${promoCode} by user ${userId}`);
          const { error: referralError } = await supabase.from("referrals").insert({
            user_id: userId,
            promo_code: promoCode,
            stripe_session_id: session.id,
            tier_purchased: tierData.tier,
            amount_paid: fullSession.amount_total ?? 0,
            currency: fullSession.currency ?? "usd",
            created_at: new Date().toISOString(),
          });
          if (referralError) {
            // Non-fatal — log but don't fail the webhook
            console.warn("[STRIPE WEBHOOK] Could not write referral row:", referralError.message);
          }
        }
      }
    } catch (affiliateErr) {
      console.warn("[STRIPE WEBHOOK] Affiliate tracking error (non-fatal):", affiliateErr);
    }

    return NextResponse.json({ received: true });
  }

  // ── customer.subscription.deleted ─────────────────────────────────────────
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;

    console.log(`[STRIPE WEBHOOK] Subscription cancelled for customer ${customerId}`);

    const { error } = await supabase
      .from("profiles")
      .update({
        tier: "free",
        favorites_slots: 1,
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_customer_id", customerId);

    if (error) {
      console.error("[STRIPE WEBHOOK] Failed to downgrade profile:", error.message);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  }

  // All other events — acknowledge and ignore
  return NextResponse.json({ received: true });
}
