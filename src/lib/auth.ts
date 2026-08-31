import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GitHubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";
import type { AuthOptions } from "next-auth";
import { prisma } from "./prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

// Centralized NextAuth config used by both the API route handler and any
// server-side `getServerSession(authOptions)` calls (e.g. in admin routes).
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    // JWT sessions let us stash `role` on the token without a DB hit on
    // every request; the DB is still the source of truth for the role.
    strategy: "jwt",
  },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    EmailProvider({
      from: process.env.EMAIL_FROM || "Workshop Team <onboarding@resend.dev>",
      sendVerificationRequest: async ({ identifier: email, url }) => {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "Workshop Team <onboarding@resend.dev>",
          to: email,
          subject: "Sign in to Workshop Registration",
          html: `
            <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
              <h1 style="font-size: 20px; margin-bottom: 4px;">Sign in to Workshop Registration 🎟️</h1>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p>Click the button below to sign in. This link expires in 24 hours.</p>
              <a href="${url}" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
                Sign in
              </a>
              <p style="margin-top: 32px; color: #999; font-size: 12px;">If you didn't request this email, you can safely ignore it.</p>
            </div>
          `,
        });
      },
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login?verify=1",
  },
  callbacks: {
    // Runs on sign-in and whenever the JWT is read/refreshed.
    async jwt({ token, user }) {
      if (user) {
        // `user` is only present right after sign-in; pull the freshest
        // role from the DB so promotions to ADMIN take effect on next login.
        token.role = (user as any).role ?? "USER";
        token.uid = user.id;
      } else if (token.uid && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.uid as string },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "USER";
      }
      return token;
    },
    // Exposes id + role on the client-facing session object.
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.uid as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
};
