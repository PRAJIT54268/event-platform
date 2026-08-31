export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";

// GET /api/admin/registrations — ADMIN only.
// This route is the actual security boundary; the /admin page's UI check
// is just a convenience, never trust the client for authorization.
export async function GET() {
  const check = await requireRole("ADMIN");
  if (!check.ok) {
    return NextResponse.json({ error: check.message }, { status: check.status });
  }

  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true, image: true } },
    },
  });

  return NextResponse.json({ registrations });
}
