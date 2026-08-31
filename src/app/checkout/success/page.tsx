export const dynamic = 'force-dynamic';

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Note: this page is a friendly "thank you" screen only. It does NOT mark
// the registration as paid — that happens server-to-server via the Stripe
// webhook (checkout.session.completed), which is the only source of truth
// for payment status. A user refreshing or forging this URL can't grant
// themselves a paid registration.
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  let status: "PAID" | "PENDING" | "UNKNOWN" = "UNKNOWN";
  if (userId && searchParams.session_id) {
    const registration = await prisma.registration.findFirst({
      where: { userId, stripeCheckoutId: searchParams.session_id },
    });
    if (registration) status = registration.status === "PAID" ? "PAID" : "PENDING";
  }

  return (
    <main className="page">
      <div className="eyebrow">Payment</div>
      <h1>{status === "PAID" ? "You're all set 🎉" : "Payment received"}</h1>
      <p className="subtitle">
        {status === "PAID"
          ? "Your ticket is confirmed and a receipt is on its way to your inbox."
          : "We're confirming your payment with Stripe — this usually takes a few seconds. A confirmation email will follow shortly."}
      </p>
      <Link className="btn" href="/dashboard">
        Back to dashboard
      </Link>
    </main>
  );
}
