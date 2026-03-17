import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createToken, setAuthCookie } from "@/lib/auth";
import { signInSchema } from "@/lib/validations";
import { json, apiError } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signInSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid email or password", 400);
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return apiError("Invalid email or password", 401);
    }

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
    console.error("Signin error:", err);
    return apiError("Internal server error", 500);
  }
}
