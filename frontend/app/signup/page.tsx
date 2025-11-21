"use client";
import React, { useState } from "react";
import Card from "../../components/Card/Card";
import PillButton from "../../components/Card/PillButton";
import { useRouter } from "next/navigation";
import Link from "next/dist/client/link";
import { API_BASE_URL } from "../../lib/config";

// Validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[a-zA-Z\s'-]{2,}$/;
const studentNoRegex = /^a0\d{7}$/i;

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentNo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Split full name into first and last name for backend
  function splitName(name: string) {
    const parts = name.trim().split(" ");
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
    };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // === Frontend validation ===
    if (!nameRegex.test(fullName.trim())) {
      setError("Please enter a valid name (letters, spaces, apostrophes, and hyphens only).");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!studentNoRegex.test(studentId.trim())) {
      setError("Student number must start with 'A0' and be followed by 7 digits.");
      return;
    }
    if (!fullName || !email || !studentId || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Prepare payload for backend
    const { firstName, lastName } = splitName(fullName);
    const payload = {
      firstName,
      lastName,
      email,
      studentId, // matches backend column name
      password,
    };

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to create account.");
      }

      setSuccess(true);
      setError(null);
      setLoading(false);

      // Redirect to login after success
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Network error. Please try again.");
      setSuccess(false);
      setLoading(false);
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
        <h1 className="text-2xl font-semibold text-slate-800 mt-2 mb-2 italic">
          Sign up today!
        </h1>
      </div>

      {/* Signup Card */}
      <Card>
        <form
          className="flex flex-col gap-6 min-w-[320px] px-4 py-6"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Sarah Heward"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. sarah.heward@my.bcit.ca"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Student Number
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. A01234567"
              value={studentId}
              onChange={(e) => setStudentNo(e.target.value)}
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
              placeholder="Enter a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          {success && (
            <div className="text-green-600 text-sm text-center">
              Signup successful! Redirecting...
            </div>
          )}

          <div>
            <PillButton type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </PillButton>
          </div>
        </form>
      </Card>

      <div className="mt-4 text-center text-slate-700">
        Already have an account?{" "}
        <a
          href="/login"
          className="text-blue-700 hover:underline font-medium"
        >
          Log in
        </a>
      </div>
    </div>
  );
}

