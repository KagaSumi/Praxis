"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../components/AuthContext";
import { useRouter } from "next/navigation";
import Card from "../../components/Card/Card";
import PillButton from "../../components/Card/PillButton";
import { API_BASE_URL } from "../../lib/config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // try to parse JSON response, but guard against invalid/non-JSON bodies so users get a proper error when login is invalid
      let data: any = null;
      try {
        data = await res.json();
      } catch (parseErr) {
        // ignore parse error; data will remain null
      }
      if (!res.ok) {
        const msg = (data && data.message) ? data.message : "Invalid credentials";
        throw new Error(msg);
      }

      setSuccess(true);
      setLoading(false);

      localStorage.setItem("user", JSON.stringify(data));
      login(data);

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      setSuccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      {/* Logo and heading */}
      <div className="flex flex-col items-center mt-12 mb-6">
        <Link href="/" className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white text-3xl font-bold">
              π
            </div>
            <span className="text-3xl font-semibold text-slate-900">Praxis</span>
          </div>
        </Link>
        <h1 className="text-2xl font-semibold text-slate-800 mt-2 mb-2">
          Log in to your account
        </h1>
      </div>

      {/* Login Card */}
      <Card>
        <form
          className="flex flex-col gap-6 min-w-[320px] px-4 py-6"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          {success && (
            <div className="text-green-600 text-sm text-center">
              Login successful!
            </div>
          )}

          <div>
            <PillButton type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </PillButton>
          </div>
        </form>
      </Card>

      <div className="mt-4 text-center text-slate-700">
        Don't have an account?{" "}
        <a href="/signup" className="text-blue-700 hover:underline font-medium">
          Sign up
        </a>
      </div>
    </div>
  );
}

