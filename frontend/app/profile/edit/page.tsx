"use client";
import React, { useEffect, useState } from "react";
import Card from "../../../components/Card/Card";
import PillButton from "../../../components/Card/PillButton";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../../lib/config";

const nameRegex = /^[a-zA-Z\s'-]{2,}$/;
const studentNoRegex = /^a0\d{7}$/i;

export default function EditProfilePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const raw = localStorage.getItem("user");
        const loggedIn = raw ? JSON.parse(raw) : null;
        const userId = loggedIn?.userId ?? loggedIn?.user_id ?? loggedIn?.id ?? null;
        if (!userId) return;

        const res = await fetch(`${API_BASE_URL}/api/users/${userId}`);
        if (!res.ok) return;
        const u = await res.json();
        setFirstName(u.first_name || "");
        setLastName(u.last_name || "");
        setStudentId(u.student_id || "");
      } catch (err) {
      }
    }
    loadUser();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nameRegex.test(firstName.trim()) || !nameRegex.test(lastName.trim())) {
      setError("Please enter a valid first and last name.");
      return;
    }
    if (!studentNoRegex.test(studentId.trim())) {
      setError("Student number must start with 'A0' and be followed by 7 digits.");
      return;
    }
    if (password && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // If user is attempting to change password, require current password
    if (password && !currentPassword) {
      setError("Enter your current password to change to a new password.");
      return;
    }

    try {
      setLoading(true);
      const raw = localStorage.getItem("user");
      const loggedIn = raw ? JSON.parse(raw) : null;
      const userId = loggedIn?.userId ?? loggedIn?.user_id ?? loggedIn?.id ?? null;
      if (!userId) throw new Error("Not logged in");

      const payload: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        studentId: studentId.trim(),
      };
      if (password) {
        payload.password = password;
        payload.currentPassword = currentPassword;
      }

      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to update profile...invalid credentials");

      // Update localStorage user display name if present
      try {
        const localuser = localStorage.getItem("user");
        if (localuser) {
          const u = JSON.parse(localuser);
          u.firstName = firstName.trim();
          u.lastName = lastName.trim();
          localStorage.setItem("user", JSON.stringify(u));
        }
      } catch (e) {

      }

      setSuccess(true);
      setError(null);
      setLoading(false);

      setTimeout(() => {
        router.push('/profile');
      }, 900);
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
      setSuccess(false);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      <div className="flex flex-col items-center mt-12 mb-6">
        <h1 className="text-2xl font-semibold text-slate-800 mt-2 mb-2 italic">Edit Profile</h1>
      </div>

      <Card>
        <form className="flex flex-col gap-6 min-w-[320px] px-4 py-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 outline-none"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 outline-none"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Student Number</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 outline-none"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Password (required to change)</label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 outline-none"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Password (leave blank to keep current)</label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && (<div className="text-red-600 text-sm text-center">{error}</div>)}
          {success && (<div className="text-green-600 text-sm text-center">Profile updated! Redirecting...</div>)}

          <div className="flex gap-3">
            <PillButton type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</PillButton>
            <button
              type="button"
              onClick={() => router.push('/profile')}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
