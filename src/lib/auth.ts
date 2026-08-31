import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import type { AuthOptions } from "next-auth";
import { prisma } from "./prisma";

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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
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
