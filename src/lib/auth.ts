/**
 * JWT-based authentication utilities
 * Uses jose for secure, standards-compliant JWT handling
 */
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { User, Role } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-dev-secret-min-32-characters"
);

const TOKEN_NAME = "learn-track-token";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  exp: number;
}

export async function createToken(user: Pick<User, "id" | "email" | "role">) {
  return new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${TOKEN_MAX_AGE}s`)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_NAME)?.value;
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

export async function getSession(): Promise<JWTPayload | null> {
  const token = await getAuthCookie();
  if (!token) return null;
  return verifyToken(token);
}
