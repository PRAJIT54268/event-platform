import { getServerSession } from "next-auth";
import Link from "next/link";
export const dynamic = 'force-dynamic';
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutButton } from "@/components/CheckoutButton";
import { SignOutButton } from "@/components/SignOutButton";

const WORKSHOP_NAME = process.env.WORKSHOP_NAME || "Workshop Ticket";
const PRICE_CENTS = Number(process.env.WORKSHOP_PRICE_CENTS || 4900);
const CURRENCY = process.env.WORKSHOP_CURRENCY || "usd";

export default async function DashboardPage() {
  // middleware.ts already guarantees a session exists for this route.
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id as string;
  const role = (session!.user as any).role as string;

  const paidRegistration = await prisma.registration.findFirst({
    where: { userId, status: "PAID" },
  });

  const price = (PRICE_CENTS / 100).toLocaleString("en-US", {
    style: "currency",
    currency: CURRENCY.toUpperCase(),
  });

  return (
    <main className="page">
      <div className="top-row">
        <div className="user-chip">
          {session!.user?.image && <img src={session!.user.image} alt="" />}
          <span>{session!.user?.name}</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {role === "ADMIN" && <Link href="/admin">Admin</Link>}
          <SignOutButton />
        </div>
      </div>

      <div className="eyebrow">Your Registration</div>
      <h1>{WORKSHOP_NAME}</h1>
      <p className="subtitle">One seat, {price}. Paid securely via Stripe test mode.</p>

      <div className="ticket">
        <div className="ticket-main">
          <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{WORKSHOP_NAME}</p>
          <p style={{ margin: "0 0 16px", color: "#777", fontSize: 14 }}>
            Attendee: {session!.user?.email}
          </p>
          <CheckoutButton alreadyRegistered={!!paidRegistration} />
        </div>
        <div className="ticket-stub">
          <span>ADMIT ONE</span>
        </div>
      </div>
    </main>
  );
}
