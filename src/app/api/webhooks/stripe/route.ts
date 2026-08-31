export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendConfirmationEmail } from "@/lib/email";

// Stripe requires the raw request body (unparsed) to verify the webhook
// signature, so we disable Next's default body parsing for this route.
export const runtime = "nodejs";

const WORKSHOP_NAME = process.env.WORKSHOP_NAME || "Workshop Ticket";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    // This is the step that actually proves the request came from Stripe
    // and wasn't forged by a client hitting this URL directly.
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const registration = await prisma.registration.findUnique({
      where: { stripeCheckoutId: session.id },
      include: { user: true },
    });

    if (!registration) {
      console.error("No matching registration for checkout session", session.id);
      return NextResponse.json({ received: true });
    }

    // Idempotency: Stripe may retry webhook delivery. Skip re-processing
    // (and re-emailing) a registration that's already marked PAID.
    if (registration.status === "PAID") {
      return NextResponse.json({ received: true });
    }

    const updated = await prisma.registration.update({
      where: { id: registration.id },
      data: {
        status: "PAID",
        stripePaymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : undefined,
      },
      include: { user: true },
    });

    try {
      await sendConfirmationEmail({
        to: updated.user.email!,
        name: updated.user.name,
        amountCents: updated.amountCents,
        currency: updated.currency,
        workshopName: WORKSHOP_NAME,
        registrationId: updated.id,
      });
      await prisma.registration.update({
        where: { id: updated.id },
        data: { confirmationEmailSent: true },
      });
    } catch (emailError) {
      // A failed email should never fail the webhook response — Stripe
      // would just keep retrying a payment event that already succeeded.
      console.error("Failed to send confirmation email:", emailError);
    }
  }

  return NextResponse.json({ received: true });
}
