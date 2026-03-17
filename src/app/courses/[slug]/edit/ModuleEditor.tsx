"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Module } from "@prisma/client";

interface Props {
  courseId: string;
  modules: Module[];
}

export function ModuleEditor({ courseId, modules: initialModules }: Props) {
  const [modules, setModules] = useState(initialModules);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  async function createModule(title: string, content: string) {
    setLoading("new");
    try {
      const res = await fetch(`/api/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          content,
          order: modules.length,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setModules((m) => [...m, data.module]);
        setShowNew(false);
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  }

  async function updateModule(moduleId: string, data: { title?: string; content?: string }) {
    setLoading(moduleId);
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      if (res.ok) {
        setModules((m) => m.map((x) => (x.id === moduleId ? updated.module : x)));
        setExpandedId(null);
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  }

  async function deleteModule(moduleId: string) {
    if (!confirm("Delete this module?")) return;
    setLoading(moduleId);
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setModules((m) => m.filter((x) => x.id !== moduleId));
        setExpandedId(null);
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-4 space-y-2">
      {modules.map((mod, idx) => (
        <div
          key={mod.id}
          className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between p-4">
            <button
              type="button"
              onClick={() => setExpandedId(expandedId === mod.id ? null : mod.id)}
              className="flex flex-1 items-center gap-3 text-left"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-medium dark:bg-slate-800">
                {idx + 1}
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {mod.title}
              </span>
            </button>
            <button
              type="button"
              onClick={() => deleteModule(mod.id)}
              disabled={loading === mod.id}
              className="text-sm text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
            >
              Delete
            </button>
          </div>
          {expandedId === mod.id && (
            <ModuleForm
              module={mod}
              onSave={(d) => updateModule(mod.id, d)}
              onCancel={() => setExpandedId(null)}
              loading={loading === mod.id}
            />
          )}
        </div>
      ))}
      {showNew ? (
        <NewModuleForm
          onSave={createModule}
          onCancel={() => setShowNew(false)}
          loading={loading === "new"}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="w-full rounded-lg border border-dashed border-slate-300 py-4 text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-indigo-800 dark:hover:text-indigo-400"
        >
          + Add module
        </button>
      )}
    </div>
  );
}

function ModuleForm({
  module,
  onSave,
  onCancel,
  loading,
}: {
  module: Module;
  onSave: (data: { title: string; content: string }) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [title, setTitle] = useState(module.title);
  const [content, setContent] = useState(module.content);

  return (
    <div className="border-t border-slate-200 p-4 dark:border-slate-800">
      <div className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Module title"
          className="block w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          rows={6}
          className="block w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onSave({ title, content })}
            disabled={loading}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function NewModuleForm({
  onSave,
  onCancel,
  loading,
}: {
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Module title"
          className="block w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          rows={6}
          className="block w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onSave(title, content)}
            disabled={loading || !title.trim() || !content.trim()}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            Add
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
