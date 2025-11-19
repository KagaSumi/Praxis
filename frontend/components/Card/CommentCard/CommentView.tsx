"use client";

import { useState } from "react";
// models
import { Comment } from "../../../model/CommentModel";
import CommentForm from "../../CommentForm";

export default function CommentView({
  comment,
  isOwner,
  onEdit,
  onDelete,
}: {
  comment: Comment;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}) {
  const [showReply, setShowReply] = useState(false);

  const isAI = comment.user_id === 1;

  // AI response will contain some info we don't always want to display (like original response and original AI answer) so this will parse just the user feedback. It's good to have original parameters in case there are edits to original question/answer, but probably better ways to do it then include it in AI response.
  let parsed: { reply?: string; prompt?: string; userFeedback?: string } | null = null;
  if (comment.user_id === 1) {
    try {
      const j = JSON.parse(comment.body);
      if (j && (typeof j.reply === "string" || typeof j.prompt === "string")) {
        parsed = { reply: j.reply, prompt: j.prompt };
        // Since the AI response is not guaranteed to be well-formed, we try several methods to get just user feedback. This probably needs a rethink....
        try {
          const promptStr = String(j.prompt ?? "");

          // 1) try to parse prompt as JSON
          const jsonMatch = promptStr.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const obj = JSON.parse(jsonMatch[0]);
              if (obj && (obj.user_feedback || obj.userFeedback)) {
                parsed.userFeedback = obj.user_feedback ?? obj.userFeedback;
              }
            } catch (e) {
              // ignore
            }
          }

          // 2) try regex to find common label patterns
          if (!parsed.userFeedback) {
            const m2 = promptStr.match(/user[_\s-]?feedback"?\s*[:=]\s*"([\s\S]*?)"/i);
            if (m2) parsed.userFeedback = m2[1].trim();
          }

          // 3) try split on common label and take remainder
          if (!parsed.userFeedback) {
            const parts = promptStr.split(/User feedback:|user feedback:|user_feedback:/i);
            if (parts.length > 1) {
              parsed.userFeedback = parts.slice(1).join(" ").trim();
              parsed.userFeedback = parsed.userFeedback.replace(/^\s*["'`]+/, "").replace(/["'`]+\s*$/, "");
            }
          }
        } catch (_e) {
        }
      }
    } catch (e) {
      parsed = null;
    }
  }

  return (
    <div className="flex flex-col gap-2 ">
      <ul className="text-sm ">
        <li key={comment.comment_id} className="mb-[5px]">
          {parsed ? (
            <div className="flex flex-col gap-3">
              <div className="prose">
                <div className="p-3 rounded-lg border border-indigo-200 bg-gradient-to-b from-indigo-50 to-white shadow-sm ring-1 ring-indigo-50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-600 text-white text-xs font-semibold">
                      AI
                    </div>
                    <div className="text-sm text-slate-700 font-medium">AI-generated reply</div>
                  </div>
                  <div className="text-sm text-slate-800">{parsed.reply}</div>
                </div>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-semibold">User feedback</div>
                  <div className="text-[11px] text-slate-400">(used to regenerate)</div>
                </div>
                <pre className="whitespace-pre-wrap bg-slate-100 p-2 rounded text-xs font-mono border border-slate-100">
                  {parsed.userFeedback ?? parsed.prompt}
                </pre>
              </div>
            </div>
          ) : (
            <>
              {comment.body} -{" "}
              <span className="text-blue-500 cursor-pointer">
                {comment.first_name} {comment.last_name}
              </span>
              <span className="text-slate-500"> {comment.created_at}</span>
            </>
          )}
          <div>
            {isOwner ? (
              <div className="flex flex-row gap-2">
                <button
                  onClick={onEdit}
                  className="text-slate-500 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="text-slate-500 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            ) : null}
          </div>

          <div className="mt-2">
            <button
              onClick={() => setShowReply((s) => !s)}
              className="text-sm text-blue-500"
            >
              {showReply ? "Cancel" : "Reply"}
            </button>
          </div>

          {showReply ? (
            <div className="mt-2">
              <CommentForm
                questionId={comment.question_id}
                answerId={comment.answer_id}
                parentCommentBody={comment.body}
                parentIsAI={isAI}
              />
            </div>
          ) : null}
        </li>
      </ul>
    </div>
  );
}
