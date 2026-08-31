"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginButtons() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";
  const verify = params.get("verify");

  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(!!verify);
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await signIn("email", { email, callbackUrl, redirect: false });
    setEmailSent(true);
    setLoading(false);
  };

  if (emailSent) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Check your email ✉️</h2>
        <p className="subtitle">
          We sent a magic link to your inbox. Click it to sign in.
        </p>
        <button
          className="oauth-btn"
          style={{ marginTop: "1rem" }}
          onClick={() => setEmailSent(false)}
        >
          Try a different method
        </button>
      </div>
    );
  }

  return (
    <div className="oauth-list">
      <button className="oauth-btn" onClick={() => signIn("github", { callbackUrl })}>
        <GitHubIcon />
        Continue with GitHub
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1rem 0" }}>
        <hr style={{ flex: 1, border: "none", borderTop: "1px solid #ddd" }} />
        <span style={{ color: "#999", fontSize: "0.85rem" }}>or</span>
        <hr style={{ flex: 1, border: "none", borderTop: "1px solid #ddd" }} />
      </div>

      <form onSubmit={handleEmailSignIn} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "6px",
            border: "1px solid #ddd",
            fontSize: "1rem",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          className="oauth-btn"
          style={{ justifyContent: "center" }}
        >
          {loading ? "Sending..." : "Continue with Email"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="page">
      <div className="eyebrow">Workshop Registration</div>
      <h1>Sign in to register</h1>
      <p className="subtitle">
        No password to remember — use your GitHub account or a magic email link.
      </p>

      <Suspense fallback={<div style={{ textAlign: "center", marginTop: "1rem" }}>Loading...</div>}>
        <LoginButtons />
      </Suspense>
    </main>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="#181717">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
