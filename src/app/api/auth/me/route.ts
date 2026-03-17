import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-helpers";
import { json } from "@/lib/api-helpers";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const user = await prisma.user.findUnique({
    where: { id: session!.userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  if (!user) {
    return json({ error: "User not found" }, 404);
  }

  return json({ user });
}
