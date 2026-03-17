"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { SignOutButton } from "./SignOutButton";

export function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-slate-800 dark:bg-slate-950/95">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-slate-900 dark:text-white"
        >
          LearnTrack
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/courses"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Courses
          </Link>
          {loading ? (
            <span className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Dashboard
              </Link>
              {(user.role === "INSTRUCTOR" || user.role === "ADMIN") && (
                <Link
                  href="/courses/new"
                  className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Create Course
                </Link>
              )}
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
