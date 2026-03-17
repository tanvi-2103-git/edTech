"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CourseFormProps {
  course?: {
    id: string;
    title: string;
    description: string | null;
    published: boolean;
  };
}

export function CourseForm({ course }: CourseFormProps) {
  const [title, setTitle] = useState(course?.title ?? "");
  const [description, setDescription] = useState(course?.description ?? "");
  const [published, setPublished] = useState(course?.published ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const isEdit = !!course;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = isEdit ? `/api/courses/${course.id}` : "/api/courses";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, description, published }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      router.push(isEdit ? `/courses/${data.course.slug}` : `/courses/${data.course.slug}/edit`);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="published"
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="size-4 rounded border-slate-300"
        />
        <label htmlFor="published" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Publish course (visible to learners)
        </label>
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Saving..." : isEdit ? "Update" : "Create"}
        </button>
        <Link
          href={isEdit ? `/courses/${course.id}` : "/dashboard"}
          className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
