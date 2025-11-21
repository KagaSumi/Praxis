"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../../lib/config";
// components
import QuestionView from "./QuestionView";
import QuestionEdit from "./QuestionEdit";
import CommentCard from "../CommentCard/CommentCard";

// model
import { QuestionWithAnswer } from "../../../model/QuestionModel";

export default function QuestionCard({
  question,
  currentUserId,
}: {
  question: QuestionWithAnswer;
  currentUserId?: number;
}) {
  const [isEditting, setIsEditting] = useState(false);
  const [resolvedCurrentUserId] = useState<number | null>(() => {
    if (typeof currentUserId === "number") return currentUserId;
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const u = JSON.parse(raw);
      const id = u?.userId ?? u?.user_id ?? u?.id ?? null; //need this until we have consistent naming conventions
      return id == null ? null : Number(id);
    } catch (e) {
      return null;
    }
  });

  const isOwner =
    resolvedCurrentUserId !== null && question.userId === resolvedCurrentUserId;
  const router = useRouter();

  async function handleSave(newContent: QuestionWithAnswer) {
    if (!confirm("Save this edit?")) {
      return;
    }

    const newContentJson = JSON.stringify(newContent);
    await fetch(`${API_BASE_URL}/api/questions/${question.questionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: newContentJson,
    });

    setIsEditting(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this question?")) {
      return;
    }

    const res = await fetch(
      `${API_BASE_URL}/api/questions/${question.questionId}`,
      {
        method: "DELETE",
      },
    );

    if (res.ok) {
      router.push("/");
      return;
    }

    const text = await res.text().catch(() => "Failed to delete question");
    alert(`Delete failed: ${text}`);
  }

  if (isEditting) {
    return (
      <QuestionEdit
        question={question}
        onSave={handleSave}
        onCancel={() => setIsEditting(false)}
      />
    );
  }

  return (
    <div>
      <QuestionView
        question={question}
        isOwner={isOwner}
        onEdit={() => setIsEditting(true)}
        onDelete={handleDelete}
      />
    </div>
  );
}
