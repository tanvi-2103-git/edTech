import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { updateCourseSchema } from "@/lib/validations";
import { requireRole } from "@/lib/api-helpers";
import { json, apiError } from "@/lib/api-helpers";

/** GET /api/courses/[id] - Get single course */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const course = await prisma.course.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      creator: { select: { id: true, name: true } },
      modules: { orderBy: { order: "asc" } },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) return apiError("Course not found", 404);
  if (!course.published) {
    const { session, error } = await requireRole(["INSTRUCTOR", "ADMIN"]);
    if (error) return error;
    const isCreator = session!.userId === course.creatorId;
    if (!isCreator) return apiError("Course not found", 404);
  }

  return json({ course });
}

/** PATCH /api/courses/[id] - Update course (creator/admin only) */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireRole(["INSTRUCTOR", "ADMIN"]);
  if (error) return error;

  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) return apiError("Course not found", 404);
  if (course.creatorId !== session!.userId && session!.role !== "ADMIN") {
    return apiError("Forbidden", 403);
  }

  const body = await request.json();
  const parsed = updateCourseSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      parsed.error.issues.map((e) => e.message).join(", ") || "Validation failed",
      400
    );
  }

  const updated = await prisma.course.update({
    where: { id },
    data: parsed.data,
    include: {
      creator: { select: { id: true, name: true } },
      modules: { orderBy: { order: "asc" } },
    },
  });

  return json({ course: updated });
}

/** DELETE /api/courses/[id] - Delete course (creator/admin only) */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireRole(["INSTRUCTOR", "ADMIN"]);
  if (error) return error;

  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) return apiError("Course not found", 404);
  if (course.creatorId !== session!.userId && session!.role !== "ADMIN") {
    return apiError("Forbidden", 403);
  }

  await prisma.course.delete({ where: { id } });
  return json({ success: true });
}
