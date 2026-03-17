import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CourseForm } from "../../CourseForm";
import { ModuleEditor } from "./ModuleEditor";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditCoursePage({ params }: Props) {
  const { slug } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "INSTRUCTOR" && session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const course = await prisma.course.findFirst({
    where: { OR: [{ id: slug }, { slug }] },
    include: { modules: { orderBy: { order: "asc" } } },
  });

  if (!course) notFound();
  if (course.creatorId !== session.userId && session.role !== "ADMIN") {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        Edit Course
      </h1>
      <CourseForm course={course} />
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Modules
        </h2>
        <ModuleEditor courseId={course.id} modules={course.modules} />
      </section>
    </div>
  );
}
