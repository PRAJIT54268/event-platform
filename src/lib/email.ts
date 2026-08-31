import { Resend } from "resend";

// Use a dummy key if not set to prevent Next.js static build errors
const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

interface ConfirmationEmailArgs {
  to: string;
  name?: string | null;
  amountCents: number;
  currency: string;
  workshopName: string;
  registrationId: string;
}

/**
 * Sends the "you're in" confirmation email after Stripe confirms payment.
 * Called only from the webhook handler, never from the client-facing
 * checkout flow, so it can't be triggered without a real payment event.
 */
export async function sendConfirmationEmail({
  to,
  name,
  amountCents,
  currency,
  workshopName,
  registrationId,
}: ConfirmationEmailArgs) {
  const amount = (amountCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  });
  const greetingName = name?.split(" ")[0] || "there";

  const html = `
  <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
    <h1 style="font-size: 20px; margin-bottom: 4px;">You're registered 🎟️</h1>
    <p style="color: #555; margin-top: 0;">Confirmation for ${workshopName}</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
    <p>Hi ${greetingName},</p>
    <p>
      Thanks for registering for <strong>${workshopName}</strong>. Your payment of
      <strong>${amount}</strong> was successful and your seat is confirmed.
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
      <tr>
        <td style="padding: 8px 0; color: #777;">Confirmation ID</td>
        <td style="padding: 8px 0; text-align: right; font-family: monospace;">${registrationId}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #777; border-top: 1px solid #eee;">Amount paid</td>
        <td style="padding: 8px 0; text-align: right; border-top: 1px solid #eee;">${amount}</td>
      </tr>
    </table>
    <p>We'll send joining details closer to the date. If anything looks wrong, just reply to this email.</p>
    <p style="margin-top: 32px; color: #999; font-size: 12px;">This is a test-mode receipt — no real charge was made.</p>
  </div>`;

  return resend.emails.send({
    from: process.env.EMAIL_FROM || "Workshop Team <onboarding@resend.dev>",
    to,
    subject: `You're confirmed for ${workshopName}`,
    html,
  });
}
