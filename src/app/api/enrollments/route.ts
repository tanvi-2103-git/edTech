import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/api-helpers";
import { json } from "@/lib/api-helpers";

/** GET /api/enrollments - List current user's enrollments with progress */
export async function GET() {
  const { session, error } = await requireRole(["LEARNER", "INSTRUCTOR", "ADMIN"]);
  if (error) return error;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session!.userId },
    include: {
      course: {
        include: {
          creator: { select: { name: true } },
          _count: { select: { modules: true } },
          modules: { select: { id: true }, orderBy: { order: "asc" } },
        },
      },
      progress: true,
    },
  });

  return json({ enrollments });
}
