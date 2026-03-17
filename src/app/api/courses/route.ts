import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createCourseSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { getSession } from "@/lib/auth";
import { requireRole } from "@/lib/api-helpers";
import { json, apiError } from "@/lib/api-helpers";

/** GET /api/courses - List courses (published for guests, all for instructors) */
export async function GET(request: NextRequest) {
  const session = await getSession();
  const publishedOnly = !session;
  const searchParams = request.nextUrl.searchParams;
  const published = searchParams.get("published");

  const where: { published?: boolean } = {};
  if (published !== null && published !== undefined) {
    if (published === "true") where.published = true;
    else if (published === "false") where.published = false;
  } else if (publishedOnly) {
    where.published = true;
  }

  const courses = await prisma.course.findMany({
    where,
    include: {
      creator: { select: { id: true, name: true } },
      _count: { select: { modules: true, enrollments: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return json({ courses });
}

/** POST /api/courses - Create course (instructors only) */
export async function POST(request: NextRequest) {
  const { session, error } = await requireRole(["INSTRUCTOR", "ADMIN"]);
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = createCourseSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        parsed.error.issues.map((e) => e.message).join(", ") || "Validation failed",
        400
      );
    }
    const { title, description, published } = parsed.data;

    let slug = slugify(title);
    const existing = await prisma.course.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        slug,
        published: published ?? false,
        creatorId: session!.userId,
      },
      include: {
        creator: { select: { id: true, name: true } },
      },
    });

    return json({ course }, 201);
  } catch (err) {
    console.error("Create course error:", err);
    return apiError("Internal server error", 500);
  }
}
