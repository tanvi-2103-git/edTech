import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [enrollments, myCourses] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: session.userId },
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
    }),
    (session.role === "INSTRUCTOR" || session.role === "ADMIN")
      ? prisma.course.findMany({
          where: { creatorId: session.userId },
          include: {
            _count: { select: { modules: true, enrollments: true } },
          },
          orderBy: { updatedAt: "desc" },
        })
      : [],
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        Dashboard
      </h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        Welcome back! Here&apos;s your learning progress.
      </p>

      {/* My Enrollments */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          My Enrollments
        </h2>
        {enrollments.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400">
              You haven&apos;t enrolled in any courses yet.
            </p>
            <Link
              href="/courses"
              className="mt-2 inline-block text-indigo-600 hover:underline dark:text-indigo-40000"
            >
              Browse courses →
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((e) => {
              const total = e.course.modules.length;
              const completed = e.progress.filter((p) => p.completed).length;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <Link
                  key={e.id}
                  href={`/courses/${e.course.slug}`}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {e.course.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {e.course.creator.name}
                  </p>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Progress</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* My Courses (instructors) */}
      {(session.role === "INSTRUCTOR" || session.role === "ADMIN") && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            My Courses
          </h2>
          {myCourses.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-400">
                You haven&apos;t created any courses yet.
              </p>
              <Link
                href="/courses/new"
                className="mt-2 inline-block text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Create your first course →
              </Link>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myCourses.map((c) => (
                <Link
                  key={c.id}
                  href={`/courses/${c.slug}/edit`}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {c.title}
                    </h3>
                    {!c.published && (
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {c._count.modules} modules · {c._count.enrollments} enrolled
                  </p>
                  <span className="mt-2 inline-block text-sm text-indigo-600 hover:underline dark:text-indigo-400">
                    Edit course →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
