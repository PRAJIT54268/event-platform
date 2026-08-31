import Stripe from "stripe";

// We don't throw at the top level so that the Next.js build doesn't crash 
// if environment variables are missing during static generation/build time.
const stripeKey = process.env.STRIPE_SECRET_KEY || "dummy_key_for_build";

// Use a pinned API version so Stripe's dashboard "test mode" behavior
// matches what this code expects.
export const stripe = new Stripe(stripeKey, {
  apiVersion: "2024-06-20",
});
