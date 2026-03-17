import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { updateProgressSchema } from "@/lib/validations";
import { requireRole } from "@/lib/api-helpers";
import { json, apiError } from "@/lib/api-helpers";

/** PATCH /api/enrollments/[enrollmentId]/progress/[moduleId] - Update module progress */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string; moduleId: string }> }
) {
  const { session, error } = await requireRole(["LEARNER", "INSTRUCTOR", "ADMIN"]);
  if (error) return error;

  const { enrollmentId, moduleId } = await params;

  const enrollment = await prisma.enrollment.findFirst({
    where: { id: enrollmentId, userId: session!.userId },
    include: { course: { include: { modules: true } } },
  });
  if (!enrollment) return apiError("Enrollment not found", 404);

  const moduleExists = enrollment.course.modules.some((m) => m.id === moduleId);
  if (!moduleExists) return apiError("Module not found in this course", 404);

  const body = await request.json();
  const parsed = updateProgressSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Invalid input", 400);
  }

  const progress = await prisma.progress.upsert({
    where: {
      enrollmentId_moduleId: { enrollmentId, moduleId },
    },
    create: {
      enrollmentId,
      moduleId,
      completed: parsed.data.completed,
      completedAt: parsed.data.completed ? new Date() : null,
    },
    update: {
      completed: parsed.data.completed,
      completedAt: parsed.data.completed ? new Date() : null,
    },
  });

  return json({ progress });
}
