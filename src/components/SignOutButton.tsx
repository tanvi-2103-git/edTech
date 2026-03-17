"use client";

import { useAuth } from "@/contexts/AuthContext";

export function SignOutButton() {
  const { refetch } = useAuth();

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST", credentials: "include" });
    await refetch();
    window.location.href = "/";
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
    >
      Sign Out
    </button>
  );
}
