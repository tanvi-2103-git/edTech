"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Module } from "@prisma/client";
import { AISummarize } from "./AISummarize";

interface ModuleWithProgress extends Module {
  progress?: { completed: boolean }[];
}

interface Props {
  modules: ModuleWithProgress[];
  enrollmentId: string | undefined;
  isInstructor: boolean;
}

export function ModuleList({ modules, enrollmentId, isInstructor }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const router = useRouter();

  async function toggleProgress(moduleId: string, completed: boolean) {
    if (!enrollmentId) return;
    await fetch(`/api/enrollments/${enrollmentId}/progress/${moduleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ completed }),
    });
    router.refresh();
  }

  return (
    <ul className="mt-4 space-y-2">
      {modules.map((mod, idx) => {
        const progress = mod.progress?.[0];
        const completed = progress?.completed ?? false;
        const isExpanded = expandedId === mod.id;

        return (
          <li
            key={mod.id}
            className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-4 p-4">
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : mod.id)}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-medium dark:bg-slate-800">
                  {idx + 1}
                </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {mod.title}
                </span>
                {enrollmentId && (
                  <input
                    type="checkbox"
                    checked={completed}
                    onChange={(e) => toggleProgress(mod.id, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    className="size-4 rounded border-slate-300"
                    aria-label={`Mark "${mod.title}" as complete`}
                  />
                )}
              </button>
              {!isInstructor && (
                <AISummarize content={mod.content} />
              )}
            </div>
            {isExpanded && (
              <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-800">
                <div className="prose prose-slate dark:prose-invert max-w-none text-sm">
                  {mod.content.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
