import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { updateModuleSchema } from "@/lib/validations";
import { requireRole } from "@/lib/api-helpers";
import { json, apiError } from "@/lib/api-helpers";

/** PATCH /api/courses/[id]/modules/[moduleId] */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> },
) {
  const { session, error } = await requireRole(["INSTRUCTOR", "ADMIN"]);
  if (error) return error;

  const { id, moduleId } = await params;
  const course = await prisma.course.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });
  if (!course) return apiError("Course not found", 404);
  const foundModule = await prisma.module.findFirst({
    where: { id: moduleId, courseId: course.id },
    include: { course: true },
  });
  if (!foundModule) return apiError("Module not found", 404);
  if (
    foundModule.course.creatorId !== session!.userId &&
    session!.role !== "ADMIN"
  ) {
    return apiError("Forbidden", 403);
  }

  const body = await request.json();
  const parsed = updateModuleSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      parsed.error.issues.map((e) => e.message).join(", ") ||
        "Validation failed",
      400,
    );
  }

  const updated = await prisma.module.update({
    where: { id: moduleId },
    data: parsed.data,
  });
  return json({ module: updated });
}

/** DELETE /api/courses/[id]/modules/[moduleId] */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> },
) {
  const { session, error } = await requireRole(["INSTRUCTOR", "ADMIN"]);
  if (error) return error;

  const { id, moduleId } = await params;
  const course = await prisma.course.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });
  if (!course) return apiError("Course not found", 404);
  const foundModule = await prisma.module.findFirst({
    where: { id: moduleId, courseId: course.id },
    include: { course: true },
  });
  if (!foundModule) return apiError("Module not found", 404);
  if (
    foundModule.course.creatorId !== session!.userId &&
    session!.role !== "ADMIN"
  ) {
    return apiError("Forbidden", 403);
  }

  await prisma.module.delete({ where: { id: moduleId } });
  return json({ success: true });
}
