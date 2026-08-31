"use client";

import { useState } from "react";

export function CheckoutButton({ alreadyRegistered }: { alreadyRegistered: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong starting checkout.");
        setLoading(false);
        return;
      }

      // Stripe-hosted Checkout page (test mode) — no card details ever
      // touch our own server.
      window.location.href = data.url;
    } catch (err) {
      setError("Network error — please try again.");
      setLoading(false);
    }
  }

  if (alreadyRegistered) {
    return <span className="status-pill status-PAID">You're registered ✓</span>;
  }

  return (
    <div>
      <button className="btn btn-block" onClick={handleCheckout} disabled={loading}>
        {loading ? "Redirecting to Stripe…" : "Pay & Register"}
      </button>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
