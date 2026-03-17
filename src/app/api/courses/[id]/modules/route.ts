import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createModuleSchema } from "@/lib/validations";
import { requireRole } from "@/lib/api-helpers";
import { json, apiError } from "@/lib/api-helpers";

/** GET /api/courses/[id]/modules - List modules */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const course = await prisma.course.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });
  if (!course) return apiError("Course not found", 404);
  if (!course.published) {
    const { session, error } = await requireRole(["INSTRUCTOR", "ADMIN"]);
    if (error) return error;
    if (course.creatorId !== session!.userId) return apiError("Forbidden", 403);
  }

  const modules = await prisma.module.findMany({
    where: { courseId: course.id },
    orderBy: { order: "asc" },
  });
  return json({ modules });
}

/** POST /api/courses/[id]/modules - Create module (instructor/admin only) */
export async function POST(
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
  const parsed = createModuleSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      parsed.error.issues.map((e) => e.message).join(", ") || "Validation failed",
      400
    );
  }

  const module = await prisma.module.create({
    data: {
      ...parsed.data,
      courseId: course.id,
    },
  });
  return json({ module }, 201);
}
