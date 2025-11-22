"use client";

import { useState } from "react";
// model
import { Answer } from "../../../model/AnswerModel";
import { formatDate } from "../../../helpers/formatDate";
import CommentCard from "../CommentCard/CommentCard";
import CommentForm from "../../CommentForm";
import { API_BASE_URL } from "../../../lib/config";

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
  const [answerContent, setAnswerContent] = useState<string>(answer.content);
  const [comments, setComments] = useState<any[]>(answer.comments ?? []);
  const [showRefine, setShowRefine] = useState(false);
  const [refining, setRefining] = useState(false);

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
      const url = `${API_BASE_URL}/api/answers/${answer.answerId}/rate`;

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
              {answerContent} <br />
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
                <span className="text-sm text-slate-600">AI-generated response</span>
              </span>
            ) : answer.isAnonymous ? (
              <span className="text-sm text-slate-600">Anonymous</span>
            ) : (
              <>
                {answer.firstname} {answer.lastname}
              </>
            )}
          </p>
          {isAI ? (
            <div className="mt-2">
              <button
                onClick={() => setShowRefine((s) => !s)}
                aria-pressed={showRefine}
                className={
                  "inline-flex items-center gap-2 text-sm font-medium rounded " +
                  (showRefine
                    ? "px-3 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200"
                    : "px-3 py-1 bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300")
                }
              >
                {/* Praxis logo (π) as a small badge to match site branding */}
                <span
                  className={`inline-flex items-center justify-center h-4 w-4 text-[10px] font-bold rounded `}
                >
                  π
                </span>
                {showRefine ? "Close" : "Refine answer"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-3 relative pl-10 ">
        <p className="text-md font-semibold before:absolute before:-bottom-[15px] before:left-0 before:h-[1px] before:w-full before:bg-slate-300 before:content-[''] ">
          Comments
        </p>
        <div>
          {comments.map((comment) => (
            <CommentCard key={comment.comment_id ?? comment.commentId ?? comment.id ?? Math.random()} comment={comment} />
          ))}
          <CommentForm answerId={answer.answerId} />

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out mt-3 ${showRefine ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            <div className="p-3 bg-white border border-indigo-50 rounded shadow-sm">
              <RefineAIForm
                originalAnswer={answer}
                onStart={() => setRefining(true)}
                onDone={(createdComment: any) => {
                  setComments((c) => [...c, createdComment]);
                  setRefining(false);
                  setShowRefine(false);
                }}
                onError={() => setRefining(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RefineAIForm({
  originalAnswer,
  onStart,
  onDone,
  onError,
}: {
  originalAnswer: Answer;
  onStart: () => void;
  onDone: (createdComment: any) => void;
  onError: () => void;
}) {
  const [feedback, setFeedback] = useState("");
  const [working, setWorking] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!feedback.trim()) return;
    onStart();
    setWorking(true);

    try {
      // Build prompt: include question (if available) and original AI answer and user feedback
      const promptParts: string[] = [];
      // Determine the question id: prefer the answer object, otherwise derive from URL (/question/:id)
      let qId = (originalAnswer as any).questionId;
      if (!qId) {
        try {
          const m = window.location.pathname.match(/\/question\/(\d+)/);
          if (m) qId = Number(m[1]);
        } catch (e) {
          qId = undefined;
        }
      }
      if (qId) {
        // try to fetch question content for richer prompt
        try {
          const qRes = await fetch(`http://localhost:3000/api/questions/${qId}`);
          if (qRes.ok) {
            const qJson = await qRes.json();
            if (qJson?.content) promptParts.push(`Original question: "${qJson.content}"`);
          }
        } catch (err) {
          // ignore
        }
      }

      promptParts.push(`Original AI answer: "${originalAnswer.content}"`);
      promptParts.push(`User feedback: "${feedback}"`);

      const payloadForModel = {
        original_question: qId ? `http://localhost:3000/api/questions/${qId}` : "",
        original_ai_reply: originalAnswer.content,
        user_feedback: feedback,
      };

      const instruction =
        'Return a JSON object ONLY with the shape {"reply":"...","prompt":"..."}. ' +
        'The "reply" value should be the improved AI answer. The "prompt" value should be the exact text you used to generate that answer (include original question, original AI reply, and user feedback). Do not include any other text or explanation.';

      const prompt = instruction + "\n\n" + JSON.stringify({
        original_question: promptParts.find((p) => p.startsWith("Original question:")) ?? "",
        original_ai_reply: originalAnswer.content,
        user_feedback: feedback,
      });

      const answerId = (originalAnswer as any).answerId ?? null;

      const payload: any = { body: prompt };
      // helps catch bad payloads
      if (answerId) {
        payload.answer_id = answerId;
        payload.question_id = null;
      } else if (qId) {
        payload.question_id = qId;
        payload.answer_id = null;
      } else {
        payload.question_id = null;
        payload.answer_id = null;
      }

      const generateBody = JSON.stringify(payload);
      const genRes = await fetch(`${API_BASE_URL}/api/comments/generate-ai-comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: generateBody,
      });

      if (!genRes.ok) {
        const txt = await genRes.text();
        throw new Error(`Generation failed: ${txt}`);
      }

      const createdComment = await genRes.json();

      const newComment = {
        comment_id: createdComment.comment_id ?? createdComment.commentId ?? createdComment.id ?? Math.floor(Math.random() * 1e9),
        answer_id: originalAnswer.answerId,
        body: createdComment.body ?? JSON.stringify({ reply: createdComment.reply ?? "", prompt: createdComment.prompt ?? promptParts.join("\n\n") }),
        created_at: createdComment.created_at ?? new Date().toISOString(),
        user_id: createdComment.user_id ?? 1,
        first_name: createdComment.first_name ?? "AI",
        last_name: createdComment.last_name ?? "",
      };
      onDone(newComment);
    } catch (err) {
      console.error(err);
      onError();
      alert("Unable to refine AI answer. Check console for details.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Give feedback to improve the AI answer (be specific)"
        className="w-full rounded border px-2 py-1"
        required
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className={`px-3 py-1 rounded bg-blue-600 text-white ${working ? "opacity-60" : ""}`}
          disabled={working}
        >
          {working ? "Refining..." : "Refine AI answer"}
        </button>
      </div>
    </form>
  );
}
