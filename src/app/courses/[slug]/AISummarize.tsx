"use client";

import { useState } from "react";

export function AISummarize({ content }: { content: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSummarize() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: content.slice(0, 10000) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to summarize");
        return;
      }
      setSummary(data.summary);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (summary) {
    return (
      <div className="ml-4 max-w-xs rounded-md bg-indigo-50 p-3 text-xs dark:bg-indigo-900/20">
        <p className="font-medium text-indigo-800 dark:text-indigo-300">
          AI Summary
        </p>
        <p className="mt-1 text-indigo-700 dark:text-indigo-400">{summary}</p>
        <button
          type="button"
          onClick={() => setSummary(null)}
          className="mt-2 text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="ml-4">
      <button
        type="button"
        onClick={handleSummarize}
        disabled={loading}
        className="rounded-md border border-indigo-200 px-2 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/30 disabled:opacity-50"
        title="Generate AI summary"
      >
        {loading ? "..." : "Summarize"}
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
