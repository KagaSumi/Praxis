"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { API_BASE_URL } from "../lib/config";

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

  const res = await fetch(`${API_BASE_URL}/api/comments`, {
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
  parentCommentBody,
  parentIsAI,
}: {
  questionId?: number;
  answerId?: number;
  parentCommentBody?: string;
  parentIsAI?: boolean;
}) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  const router = useRouter();

  async function fetchQuestionContent(qId: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/questions/${qId}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data?.content ?? null;
    } catch (err) {
      return null;
    }
  }

  async function generateAIReply({
    questionId,
    answerId,
    parentBody,
    userFeedback,
  }: {
    questionId?: number;
    answerId?: number;
    parentBody?: string;
    userFeedback: string;
  }) {
    setGeneratingAI(true);
    try {
      let questionText: string | null = null;
      if (questionId) questionText = await fetchQuestionContent(questionId);

      const promptParts: string[] = [];
      if (questionText)
        promptParts.push(`Original question: "${questionText}"`);
      if (parentBody) promptParts.push(`Original AI reply: "${parentBody}"`);
      promptParts.push(`User feedback: "${userFeedback}"`);

      const payload = {
        original_question: questionText ?? "",
        original_ai_reply: parentBody ?? "",
        user_feedback: userFeedback,
      };

      const instruction =
        "Your reply should be the improved AI answer than the original one based on the feedback.";

      const prompt = instruction + "\n\n" + JSON.stringify(payload);

      const body = JSON.stringify({
        body: prompt,
        question_id: questionId,
        answer_id: answerId,
      });

      const res = await fetch(
        `${API_BASE_URL}/api/comments/generate-ai-comment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        },
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`AI generation failed: ${txt}`);
      }

      await res.json();
      // refresh to show the new AI comment
      window.location.reload();
    } catch (err) {
      console.error("Error generating AI reply:", err);
    } finally {
      setGeneratingAI(false);
    }
  }

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

      if (parentIsAI) {
        await generateAIReply({
          questionId,
          answerId,
          parentBody: parentCommentBody,
          userFeedback: content,
        });
      } else {
        setContent("");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      window.location.reload();
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
