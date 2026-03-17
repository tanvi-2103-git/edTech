import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              LearnTrack - Learning Path & Progress Management
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              House of Edtech Fullstack Developer Assignment
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-400">
            <p>
              <strong>Your Name</strong> — Full Stack Developer
            </p>
            <div className="flex gap-4">
              <Link
                href="https://github.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-900 dark:hover:text-white"
              >
                GitHub Profile
              </Link>
              <Link
                href="https://linkedin.com/in/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-900 dark:hover:text-white"
              >
                LinkedIn Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
