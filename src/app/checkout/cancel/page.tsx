import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="page">
      <div className="eyebrow">Payment</div>
      <h1>Checkout canceled</h1>
      <p className="subtitle">No charge was made. You can pick up registration again anytime.</p>
      <Link className="btn" href="/dashboard">
        Back to dashboard
      </Link>
    </main>
  );
}
