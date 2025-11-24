"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function Navbar() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");

  // initialize query from URL `q` param or localStorage
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search || "");
      const q = params.get("q") || localStorage.getItem("praxis-search") || "";
      setQuery(q);
    } catch (err) {
    }

    function onPraxisSearchChanged(e: Event) {
      try {
        const detail = (e as CustomEvent).detail;
        const v = typeof detail === "string" ? detail : "";
        setQuery(v || "");
      } catch (err) {
      }
    }

    function onStorage(e: StorageEvent) {
      if (e.key === "praxis-search") {
        setQuery(e.newValue || "");
      }
    }

    window.addEventListener("praxis-search-changed", onPraxisSearchChanged as EventListener);
    window.addEventListener("storage", onStorage as EventListener);
    return () => {
      window.removeEventListener("praxis-search-changed", onPraxisSearchChanged as EventListener);
      window.removeEventListener("storage", onStorage as EventListener);
    };
  }, []);

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

  function clearSearch() {
    try {
      localStorage.removeItem("praxis-search");
    } catch (err) {
      // ignore
    }
    try {
      const evt = new CustomEvent("praxis-search-changed", { detail: "" });
      window.dispatchEvent(evt as Event);
    } catch (err) {
      // ignore
    }
    setQuery("");
  }
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Site header */}
        <div className="flex items-center gap-3">
          <Link href="/" onClick={clearSearch}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <span className="text-lg font-bold">π</span>
            </div>
          </Link>
          <Link href="/" onClick={clearSearch}>
            <span className="text-lg font-semibold text-slate-900">Praxis</span>
          </Link>
        </div>

        {/* Search bar */}
        <div className="min-w-[70%] md:min-w-[50%]">
          <form onSubmit={onSubmitSearch} className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts, content or tags..."
              aria-label="Search posts"
              className="flex-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-blue-600 focus:ring-2"
            />
            <button
              type="submit"
              aria-label="Search"
              className="hidden md:inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>
        </div>

        {/* Nav links and profile */}
        <div className="ml-4 flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" onClick={clearSearch} className="text-slate-700 hover:text-blue-600 font-medium">
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
