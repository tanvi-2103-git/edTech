import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createToken, setAuthCookie } from "@/lib/auth";
import { signUpSchema } from "@/lib/validations";
import { json, apiError } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        parsed.error.issues.map((e) => e.message).join(", ") || "Validation failed",
        400
      );
    }
    const { email, password, name, role } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError("Email already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role },
    });

    const token = await createToken(user);
    await setAuthCookie(token);

    return json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return apiError("Internal server error", 500);
  }
}
