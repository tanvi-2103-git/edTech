import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { EnrollButton } from "./EnrollButton";
import { ModuleList } from "./ModuleList";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const session = await getSession();

  const course = await prisma.course.findFirst({
    where: { OR: [{ id: slug }, { slug }] },
    include: {
      creator: { select: { id: true, name: true } },
      modules: { orderBy: { order: "asc" } },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) notFound();
  if (!course.published) {
    if (!session || (session.userId !== course.creatorId && session.role !== "ADMIN")) {
      notFound();
    }
  }

  let enrollment: { id: string; progress: { moduleId: string; completed: boolean }[] } | null = null;
  if (session) {
    const enc = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: session.userId, courseId: course.id },
      },
      include: { progress: { select: { moduleId: true, completed: true } } },
    });
    if (enc) enrollment = enc;
  }

  const modulesWithProgress = course.modules.map((m) => ({
    ...m,
    progress: enrollment?.progress.filter((p) => p.moduleId === m.id) ?? [],
  }));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl">
        <Link
          href="/courses"
          className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← Back to courses
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
          {course.title}
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          By {course.creator.name} · {course._count.enrollments} enrolled
        </p>
        {course.description && (
          <p className="mt-4 text-slate-700 dark:text-slate-300">
            {course.description}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-4">
          {session && (session.role === "INSTRUCTOR" || session.role === "ADMIN") && session.userId === course.creatorId && (
            <Link
              href={`/courses/${course.slug}/edit`}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Edit Course
            </Link>
          )}
          {session && course.published && !enrollment && (
            <EnrollButton courseId={course.id} />
          )}
          {enrollment && (
            <span className="rounded-md bg-green-100 px-4 py-2 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Enrolled
            </span>
          )}
        </div>
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Modules ({course.modules.length})
          </h2>
          {course.modules.length === 0 ? (
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              No modules yet.
            </p>
          ) : (
            <ModuleList
              modules={modulesWithProgress}
              enrollmentId={enrollment?.id}
              isInstructor={session?.userId === course.creatorId || session?.role === "ADMIN"}
            />
          )}
        </div>
      </div>
    </div>
  );
}
