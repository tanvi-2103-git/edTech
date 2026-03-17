import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 sm:py-32">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          LearnTrack
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Learning Path & Progress Management. Create structured courses, enroll in
          learning paths, and track your progress — all in one place.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/courses"
            className="w-full rounded-md bg-indigo-600 px-6 py-3 text-center font-medium text-white transition hover:bg-indigo-500 sm:w-auto"
          >
            Explore Courses
          </Link>
          <Link
            href="/register"
            className="w-full rounded-md border border-slate-300 px-6 py-3 text-center font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
          >
            Get Started
          </Link>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/50">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              For Learners
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Enroll in courses, complete modules, and track your progress with a
              clear dashboard.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/50">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              For Instructors
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Create courses with modules, publish when ready, and manage enrollments.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/50">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              AI-Powered
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Generate concise summaries of module content using AI for quick review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
