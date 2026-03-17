"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EnrollButton({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleEnroll() {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
    >
      {loading ? "Enrolling..." : "Enroll"}
    </button>
  );
}
