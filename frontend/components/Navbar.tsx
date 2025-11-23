"use client";
import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function Navbar() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmitSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      // clear any previous stored search
      try { localStorage.removeItem('praxis-search'); } catch (e) { }
      try {
        // notify any listeners in the same tab to clear their state
        const evt = new CustomEvent('praxis-search-changed', { detail: '' });
        window.dispatchEvent(evt as Event);
      } catch (e) { }
      return router.push('/');
    }
    try { localStorage.setItem('praxis-search', trimmed); } catch (e) { }
    try {
      const evt = new CustomEvent('praxis-search-changed', { detail: trimmed });
      window.dispatchEvent(evt as Event);
    } catch (e) { }
    router.push(`/?q=${encodeURIComponent(trimmed)}`);
  }
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Site header */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <span className="text-lg font-bold">π</span>
            </div>
          </Link>
          <Link href="/">
            <span className="text-lg font-semibold text-slate-900">Praxis</span>
          </Link>
        </div>

        {/* Search bar */}
        <div className="min-w-[70%] md:min-w-[50%]">
          <form onSubmit={onSubmitSearch}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts, content or tags..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-blue-600 focus:ring-2"
            />
          </form>
        </div>

        {/* Nav links and profile */}
        <div className="ml-4 flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-slate-700 hover:text-blue-600 font-medium"
            >
              Posts
            </Link>
            <Link
              href="/courses"
              className="text-slate-700 hover:text-blue-600 font-medium"
            >
              Courses
            </Link>
            <Link
              href="/tags"
              className="text-slate-700 hover:text-blue-600 font-medium"
            >
              Tags
            </Link>
          </nav>
          <Link
            href="/question/create"
            className="text-slate-700 hover:text-blue-600 font-medium"
          >
            <button
              title="Create a question"
              aria-label="New Question"
              className="hidden rounded-xl border border-slate-200 p-2 cursor-pointer hover:bg-slate-100 md:block"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-700"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button></Link>
          {isLoggedIn ? (
            <Link
              href="/profile"
              className="text-slate-700 hover:text-blue-600 font-medium"
            >
              <img
                alt="User avatar"
                className="h-9 w-9 rounded-full object-cover cursor-pointer"
                src="https://www.gravatar.com/avatar/?d=mp&s=140"
              />
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-slate-700 hover:text-blue-600 font-medium"
              title="Login"
            >
              <img
                alt="Login"
                className="h-9 w-9 rounded-full object-cover cursor-pointer bg-slate-200"
                src={"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0%200%2024%2024'><circle cx='12' cy='12' r='11' fill='%23e2e8f0'/><text x='12' y='16' font-size='12' text-anchor='middle' fill='%23475569' font-family='Arial%2C%20Helvetica%2C%20sans-serif'>?</text></svg>"}
              />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
