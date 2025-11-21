"use client";
import Link from "next/link";


export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md text-center bg-white rounded-xl shadow-md p-8">
        <div className="flex items-center justify-center mb-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-600 text-white text-4xl font-bold">
              π
            </div>
            <span className="text-2xl font-semibold text-slate-900">Praxis</span>
          </Link>
        </div>

        <h1 className="text-2xl font-semibold text-slate-900">404 — Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">We couldn't find the page you're looking for.</p>

        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Go home
          </Link>
          <Link href="/courses" className="rounded-full border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Browse courses
          </Link>
        </div>
      </div>
    </div>
  );
}
