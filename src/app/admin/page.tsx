export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  // Page-level check for a clean redirect. The API route has its own
  // identical check — this page rendering is not what makes the data safe.
  const check = await requireRole("ADMIN");
  if (!check.ok) redirect("/dashboard");

  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const paidCount = registrations.filter((r) => r.status === "PAID").length;

  return (
    <main className="page" style={{ maxWidth: 860 }}>
      <div className="top-row">
        <div>
          <div className="eyebrow">Admin</div>
          <h1>Registered users</h1>
        </div>
        <Link href="/dashboard">Back to dashboard</Link>
      </div>

      <p className="subtitle">
        {paidCount} paid / {registrations.length} total attempts
      </p>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Email sent</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((r) => (
              <tr key={r.id}>
                <td>{r.user.name || "—"}</td>
                <td>{r.user.email}</td>
                <td>
                  {(r.amountCents / 100).toLocaleString("en-US", {
                    style: "currency",
                    currency: r.currency.toUpperCase(),
                  })}
                </td>
                <td>
                  <span className={`status-pill status-${r.status}`}>{r.status}</span>
                </td>
                <td>{r.confirmationEmailSent ? "✓" : "—"}</td>
                <td>{new Date(r.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {registrations.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "#999" }}>
                  No registrations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
