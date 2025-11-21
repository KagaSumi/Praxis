"use client";
import { useState } from "react";
import { API_BASE_URL } from "../../../lib/config";

// components
import AnswerView from "./AnswerView";
import AnswerEdit from "./AnswerEdit";

// model
import { Answer } from "../../../model/AnswerModel";

export default function AnswerCard({
  answer,
  currentUserId,
}: {
  answer: Answer;
  currentUserId?: number;
}) {
  const [isEditting, setIsEditting] = useState(false);

  const [resolvedCurrentUserId] = useState<number | null>(() => {
    if (typeof currentUserId === "number") return currentUserId;
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const u = JSON.parse(raw);
      const id = u?.userId ?? u?.user_id ?? u?.id ?? null;
      return id == null ? null : Number(id);
    } catch (e) {
      return null;
    }
  });

  const isOwner =
    resolvedCurrentUserId !== null && answer.userId === resolvedCurrentUserId;

  async function handleSave(newContent: Answer) {
    if (!confirm("Save this edit?")) {
      return;
    }

    console.log(newContent);

    const newContentJson = JSON.stringify(newContent);
    console.log(newContentJson);
    await fetch(`${API_BASE_URL}/api/answers/${answer.answerId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: newContentJson,
    });

    setIsEditting(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this post?")) {
      return;
    }

    await fetch(`${API_BASE_URL}/api/answers/${answer.answerId}`, { method: "DELETE" });

    window.location.reload();
  }

  if (isEditting) {
    return (
      <AnswerEdit
        answer={answer}
        onSave={handleSave}
        onCancel={() => setIsEditting(false)}
      />
    );
  }

  return (
    <AnswerView
      answer={answer}
      isOwner={isOwner}
      onEdit={() => setIsEditting(true)}
      onDelete={handleDelete}
    />
  );
}
