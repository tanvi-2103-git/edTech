import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/api-helpers";
import { json, apiError } from "@/lib/api-helpers";

/** POST /api/courses/[id]/enroll - Enroll in course */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireRole(["LEARNER", "INSTRUCTOR", "ADMIN"]);
  if (error) return error;

  const { id } = await params;
  const course = await prisma.course.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });
  if (!course) return apiError("Course not found", 404);
  if (!course.published) return apiError("Course is not available for enrollment", 400);

  const existing = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId: session!.userId, courseId: course.id },
    },
  });
  if (existing) return apiError("Already enrolled", 409);

  const enrollment = await prisma.enrollment.create({
    data: { userId: session!.userId, courseId: course.id },
    include: {
      course: { select: { id: true, title: true, slug: true } },
      user: { select: { id: true, name: true } },
    },
  });

  return json({ enrollment }, 201);
}
