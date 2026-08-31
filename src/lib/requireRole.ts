import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Server-side guard for API routes and Server Components.
 * Returns the session if the caller is authenticated and (when a role is
 * given) holds that role — otherwise returns a descriptive error so the
 * caller can respond with the right HTTP status.
 */
export async function requireRole(role?: "ADMIN" | "USER") {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { ok: false as const, status: 401, message: "Not signed in." };
  }

  const userRole = (session.user as any).role as string | undefined;
  if (role && userRole !== role) {
    return { ok: false as const, status: 403, message: "Forbidden — insufficient role." };
  }

  return { ok: true as const, session };
}
