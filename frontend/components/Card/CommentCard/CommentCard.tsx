"use client";
import { useState } from "react";

// components
import CommentView from "./CommentView";
import CommentEdit from "./CommentEdit";

// model
import { Comment } from "../../../model/CommentModel";

export default function CommentCard({
  comment,
  currentUserId,
}: {
  comment: Comment;
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
    resolvedCurrentUserId !== null && comment.user_id === resolvedCurrentUserId;

  async function handleSave(newContent: Comment) {
    if (!confirm("Save this edit?")) {
      return;
    }

    const newContentJson = JSON.stringify(newContent);
    await fetch(`http://localhost:3000/api/comments/${comment.comment_id}`, {
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

    const body = JSON.stringify({ user_id: comment.user_id });

    await fetch(`http://localhost:3000/api/comments/${comment.comment_id}`, {
      method: "DELETE",
      body: body,
      headers: {
        "Content-Type": "application/json",
      },
    });

    window.location.reload();
  }

  if (isEditting) {
    return (
      <CommentEdit
        comment={comment}
        onSave={handleSave}
        onCancel={() => setIsEditting(false)}
      />
    );
  }

  return (
    <CommentView
      comment={comment}
      isOwner={isOwner}
      onEdit={() => setIsEditting(true)}
      onDelete={handleDelete}
    />
  );
}
