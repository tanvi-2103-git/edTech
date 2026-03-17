import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const session = await getSession();
  const isInstructor = session?.role === "INSTRUCTOR" || session?.role === "ADMIN";

  const courses = await prisma.course.findMany({
    where: { published: true },
    include: {
      creator: { select: { name: true } },
      _count: { select: { modules: true, enrollments: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        Explore Courses
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Browse our learning paths and start your journey.
      </p>
      {courses.length === 0 ? (
        <div className="mt-12 rounded-lg border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400">
            No published courses yet. Check back soon{isInstructor ? " or create one" : ""}!
          </p>
          {isInstructor && (
            <Link
              href="/courses/new"
              className="mt-4 inline-block text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Create your first course →
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900"
            >
              <h2 className="font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                {course.title}
              </h2>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                {course.description || "No description"}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
                <span>{course.creator.name}</span>
                <span>
                  {course._count.modules} modules · {course._count.enrollments} enrolled
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
