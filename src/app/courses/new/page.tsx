import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { CourseForm } from "../CourseForm";

export const dynamic = "force-dynamic";

export default async function NewCoursePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "INSTRUCTOR" && session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        Create Course
      </h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        Add a new learning path for your students.
      </p>
      <CourseForm />
    </div>
  );
}
