"use client";

import { useState } from "react";
// model
import { Answer } from "../../../model/AnswerModel";
import { formatDate } from "../../../helpers/formatDate";
import CommentCard from "../CommentCard/CommentCard";
import CommentForm from "../../CommentForm";

export default function AnswerView({
  answer,
  isOwner,
  onEdit,
  onDelete,
}: {
  answer: Answer;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}) {
  const totalVotesInitial = answer.upVotes - answer.downVotes;
  const [votes, setVotes] = useState<number>(totalVotesInitial);
  const [loading, setLoading] = useState(false);
  const isAI = answer.userId === 1;

  const resolvedUserId = (() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const u = JSON.parse(raw);
      return u?.userId ?? u?.user_id ?? u?.id ?? null;
    } catch (e) {
      return null;
    }
  })();

  async function sendVote(isUp: boolean) {
    if (!resolvedUserId) {
      alert("Please sign in to vote");
      return;
    }

    setLoading(true);
    try {
      const typeNum = isUp ? 1 : 0;
      const url = `http://localhost:3000/api/answers/${answer.answerId}/rate`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(resolvedUserId), type: typeNum }),
      });

      if (!res.ok) throw new Error("Voting failed");
      const json = await res.json();
      const newTotal =
        (json.up_votes ?? json.upVotes ?? 0) -
        (json.down_votes ?? json.downVotes ?? 0);
      setVotes(newTotal);
    } catch (err) {
      console.error(err);
      alert("Unable to submit vote");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={
        "relative flex flex-col gap-5 p-1 " +
        (isAI ? "bg-indigo-50 border border-indigo-200 rounded-lg p-3" : "")
      }
    >
      <div className="grid grid-cols-[50px_1fr] gap-5">
        <div className="flex flex-col items-center gap-2">
          {/* Upvote */}
          <div
            onClick={() => sendVote(true)}
            className={`rounded-full border border-gray-300 cursor-pointer hover:bg-blue-100 ${loading ? "opacity-60 pointer-events-none" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="30px"
              width="30px"
              viewBox="0 -960 960 960"
              fill="--color-black"
            >
              <path d="m280-400 200-200 200 200H280Z" />
            </svg>
          </div>
          <p className="text-xl">{votes}</p>
          {/* Downvote */}
          <div
            onClick={() => sendVote(false)}
            className={`rounded-full border border-gray-300 cursor-pointer hover:bg-blue-100 ${loading ? "opacity-60 pointer-events-none" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="30px"
              width="30px"
              viewBox="0 -960 960 960"
              fill="--color-black"
            >
              <path d="M480-360 280-560h400L480-360Z" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="min-h-25">
            <p>
              {answer.content} <br />
            </p>
          </div>
        </div>
      </div>

      <div className="pt-5 text-slate-500 text-sm flex flex-row justify-between">
        <div>
          {/* if owner, allow edit and delete */}
          {isOwner ? (
            <div className="flex flex-col">
              <div className=" text-slate-500 text-sm flex flex-row gap-2 pl-2">
                <button onClick={onEdit} className="cursor-pointer">
                  Edit
                </button>
                <button onClick={onDelete} className="cursor-pointer">
                  Delete
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <p>answered at {formatDate(answer.createdAt)}</p>
          <p className="cursor-pointer text-blue-500">
            {isAI ? (
              <span className="inline-flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-xs font-semibold">
                  AI
                </span>
                <span className="text-sm text-slate-600">
                  AI-generated response
                </span>
              </span>
            ) : answer.isAnonymous ? (
              <span className="text-sm text-slate-600">Anonymous</span>
            ) : (
              <>
                {answer.firstname} {answer.lastname}
              </>
            )}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3 relative pl-10 ">
        <p className="text-md font-semibold before:absolute before:-bottom-[15px] before:left-0 before:h-[1px] before:w-full before:bg-slate-300 before:content-[''] ">
          Comments
        </p>
        <div>
          {answer.comments?.map((comment) => (
            <CommentCard key={comment.comment_id} comment={comment} />
          ))}
          <CommentForm answerId={answer.answerId} />
        </div>
      </div>
    </div>
  );
}
