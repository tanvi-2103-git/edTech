/**
 * API response helpers and auth guards
 */
import { NextResponse } from "next/server";
import { getSession } from "./auth";
import type { Role } from "@prisma/client";

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}

export async function requireRole(allowedRoles: Role[]) {
  const result = await requireAuth();
  if (result.error) return result;
  const { session } = result;
  if (!allowedRoles.includes(session.role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      session: null,
    };
  }
  return { session, error: null };
}
