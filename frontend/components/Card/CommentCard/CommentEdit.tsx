"use client";
import { useState } from "react";

// models
import { Comment } from "../../../model/CommentModel";

export default function CommentEdit({
  comment,
  onSave,
  onCancel,
}: {
  comment: Comment;
  onSave: (comment: Comment) => Promise<void>;
  onCancel: () => void;
}) {
  const [content, setContent] = useState(comment.body);
  return (
    <div className="relative flex flex-col gap-2 pb-[40px] before:absolute before:bottom-[20px] before:left-0 before:h-[1px] before:w-full before:bg-slate-300 before:content-[''] ">
      <textarea
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm max-h-fit focus:ring-2 focus:ring-blue-500 outline-none"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <form
        className="flex flex-row gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          comment.body = content;
          onSave(comment);
        }}
      >
        <button
          type="submit"
          className="rounded-full bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 cursor-pointer"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer text-sm"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
