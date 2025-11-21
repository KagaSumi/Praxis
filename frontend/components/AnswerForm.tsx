"use client";

import React, { useState } from "react";
import PillButton from "./Card/PillButton";
import { API_BASE_URL } from "../lib/config";
import { useRouter } from "next/navigation";


// --- custom hook to handle form state ---
function useAnswerForm() {
  const [content, setContent] = useState("");
  const [isAnon, setIsAnon] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  return { content, setContent, submitting, setSubmitting, isAnon, setIsAnon };
}

// --- reusable function to call backend ---
async function submitAnswer({
  content,
  questionId,
  isAnonymous,
  userId,
}: {
  content: string;
  questionId: number;
  isAnonymous: boolean;
  userId: number;
}) {
  const body = JSON.stringify({
    body: content, // ✅ matches backend key
    question_id: questionId, // ✅ snake_case key
    user_id: userId, // ✅ snake_case key
    is_anonymous: isAnonymous, // ✅ snake_case key
  });

  const res = await fetch(`${API_BASE_URL}/api/answers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to submit answer: ${errText}`);
  }

  return res.json();
}

// --- main component ---
export default function AnswerForm({ questionId }: { questionId: number }) {
  const { content, setContent, submitting, setSubmitting, isAnon, setIsAnon } =
    useAnswerForm();

  const router = useRouter();
  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    setIsAnon(e.target.checked);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); // ✅ prevents page refresh
    const trimmed = content.trim();
    if (!trimmed) return;
    setContent(trimmed);

    setSubmitting(true);
    try {
      // ✅ dynamically get user from localStorage (if available)
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?.userId;
      if (!userId) {
        alert("You must be signed in to answer a question.");
        return;
      }

      // ✅ call backend
      const response = await submitAnswer({
        content: trimmed,
        questionId,
        isAnonymous: isAnon,
        userId,
      });

      console.log("✅ Answer submitted:", response);
      setContent("");
      router.push(`/question/${questionId}`);
    } catch (err) {
      console.error("❌ Error submitting answer:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <details className="pt-5 group flex flex-col gap-3">
      <summary className="select-none size-fit rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm cursor-pointer hover:bg-blue-700">
        Click to answer
      </summary>
      <form
        onSubmit={onSubmit}
        className="opacity-0 group-open:opacity-100 transition-opacity duration-500 ease-in-out"
      >
        <textarea
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Add answer in detail"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <div className="flex flex-col gap-2">
          <div className="pl-1">
            <input
              onChange={handleCheckboxChange}
              type="checkbox"
              id="setAnon"
              name="setAnon"
              checked={isAnon}
            />
            <label htmlFor="setAnon" className="pl-2">
              Set anonymous
            </label>
          </div>
          <div>
            <PillButton type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Answer"}
            </PillButton>
          </div>
        </div>
      </form>
    </details>
  );
}
