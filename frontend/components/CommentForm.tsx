"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// component
import PillButton from "./Card/PillButton";

async function addComment({
  content,
  questionId,
  answerId,
  userId,
}: {
  content: string;
  questionId: number | undefined;
  answerId: number | undefined;
  userId: number;
}) {
  if (!questionId && !answerId)
    throw new Error("QuestionId or AnswerId is required to upload a comment");

  let body: string;
  if (questionId === undefined) {
    body = JSON.stringify({
      body: content,
      answer_id: answerId,
      user_id: userId,
    });
  } else {
    body = JSON.stringify({
      body: content,
      question_id: questionId,
      user_id: userId,
    });
  }

  const res = await fetch("http://localhost:3000/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to add comment: ${errText}`);
  }

  return res.json();
}

export default function CommentForm({
  questionId,
  answerId,
}: {
  questionId?: number;
  answerId?: number;
}) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setContent(content);
    setSubmitting(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?.userId;
      if (!userId) {
        alert("You must be signed in to answer a question.");
        return;
      }

      await addComment({
        content: content,
        questionId,
        answerId,
        userId,
      });

      setContent("");
      window.location.reload();
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <details className="pt-2 group flex flex-col gap-3">
      <summary className="select-none size-fit text-sm text-blue-500 cursor-pointer ">
        Add comment
      </summary>
      <form
        onSubmit={onSubmit}
        className="opacity-0 group-open:opacity-100 transition-opacity duration-500 ease-in-out"
      >
        <textarea
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm size-fit focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Add comment"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <div className="flex flex-col gap-2">
          <div>
            <PillButton type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Comment"}
            </PillButton>
          </div>
        </div>
      </form>
    </details>
  );
}
