export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const PRICE_CENTS = Number(process.env.WORKSHOP_PRICE_CENTS || 4900);
const CURRENCY = process.env.WORKSHOP_CURRENCY || "usd";
const WORKSHOP_NAME = process.env.WORKSHOP_NAME || "Workshop Ticket";

export async function POST() {
  // Require login before we ever talk to Stripe — checkout is not
  // reachable by an anonymous request.
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "You must be signed in to register." }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const email = session.user.email!;

  // Block duplicate paid registrations — one ticket per user.
  const existing = await prisma.registration.findFirst({
    where: { userId, status: "PAID" },
  });
  if (existing) {
    return NextResponse.json({ error: "You're already registered for this workshop." }, { status: 409 });
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: CURRENCY,
          product_data: { name: WORKSHOP_NAME },
          unit_amount: PRICE_CENTS,
        },
        quantity: 1,
      },
    ],
    // Used by the webhook to map the Stripe event back to our user
    // without trusting anything the client sends after redirect.
    metadata: { userId },
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout/cancel`,
  });

  // Record the attempt as PENDING now; the webhook flips it to PAID.
  // This lets an admin see abandoned checkouts, not just successful ones.
  await prisma.registration.create({
    data: {
      userId,
      status: "PENDING",
      stripeCheckoutId: checkoutSession.id,
      amountCents: PRICE_CENTS,
      currency: CURRENCY,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
