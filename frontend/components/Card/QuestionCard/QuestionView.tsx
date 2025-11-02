"use client";
// components
import Card from "../Card";
import { useEffect, useState } from "react";
import Tag from "../Tag";
import { formatDate } from '../../../helpers/formatDate';
import AnswerForm from "../../AnswerForm";

// model
import { QuestionWithAnswer } from "../../../model/QuestionModel";

export default function QuestionView({
  question,
  isOwner,
  onEdit,
  onDelete,
}: {
  question: QuestionWithAnswer;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}) {
  const totalVotesInitial = question.upVotes - question.downVotes;
  const [votes, setVotes] = useState<number>(totalVotesInitial);
  const [loading, setLoading] = useState(false);
  const [courseName, setCourseName] = useState<string | null>(null);
  const [courseLoading, setCourseLoading] = useState<boolean>(false);

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
      const url = `http://localhost:3000/api/questions/${question.questionId}/rate`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(resolvedUserId), type: typeNum }),
      });

      if (!res.ok) throw new Error("Voting failed");
      const json = await res.json();
      const newTotal = (json.up_votes ?? json.upVotes ?? 0) - (json.down_votes ?? json.downVotes ?? 0);
      setVotes(newTotal);
    } catch (err) {
      console.error(err);
      alert("Unable to submit vote");
    } finally {
      setLoading(false);
    }
  }

  // another request so we know what course the question is under...we should probably change backend to include this when viewing a post
  useEffect(() => {
    async function loadCourse() {
      try {
        setCourseLoading(true);
        const res = await fetch(`http://localhost:3000/api/courses/${question.courseId}`);
        if (!res.ok) throw new Error("Failed to load course");
        const data = await res.json();
        setCourseName(data?.name ?? data?.code ?? null);
      } catch (e) {
        setCourseName(null);
        console.warn("Unable to fetch course details for question", question.courseId, e);
      } finally {
        setCourseLoading(false);
      }
    }
    loadCourse();
  }, [question.courseId]);

  return (
    <Card>
      <div className="flex flex-col gap-10 p-2">
        {/* header section */}
        <div className="pl-2 flex flex-col gap-2">
          {/* title */}
          <h1 className="text-2xl font-semibold text-slate-900">
            {question.title}
          </h1>

          {/* info (name, when posted, etc) */}
          <div className="flex flex-row align-center gap-10">
            <p className="text-sm text-slate-500">
              Asked: <span className="font-semibold">{formatDate(question.createdAt)}</span>
            </p>
            <p className="text-sm text-slate-500">
              Modified:{" "}
              <span className="font-semibold">{formatDate(question.updatedAt)}</span>
            </p>
            <p className="text-sm text-slate-500">
              Views: <span className="font-semibold">{question.viewCount}</span>
            </p>
            <p className="text-sm text-slate-500">
              Course:{" "}
              <span className="font-semibold">
                {courseLoading ? "Loading..." : (courseName ?? `#${question.courseId}`)}
              </span>
            </p>
            <div className="text-sm text-slate-500">
              Author:{" "}
              <span className="font-semibold">
                {/* if anon */}
                {question.isAnonymous ? (
                  <span className="text-sm text-slate-600">Anonymous</span>
                ) : (
                  <a
                    href={`/profile/${question.userId}`}
                    className="text-sm text-slate-600 underline "
                  >
                    {question.firstname} {question.lastname}
                  </a>
                )}
              </span>
            </div>
          </div>

          {/** Tags */}
          <div className="mt-3 flex flex-row flex-wrap gap-1">
            {((question as any).tags || (question as any).tag || []).map(
              (t: string) => (
                <Tag key={t}>{t}</Tag>
              ),
            )}
          </div>
        </div>

        {/* content section */}
        <div className="flex flex-col gap-5 p-1 relative">
          <div className="relative grid grid-cols-[50px_1fr] gap-5 before:absolute before:top-[-26px] before:left-1/2 before:transform before:-translate-x-1/2 before:h-[1px] before:w-[100%] before:bg-slate-300 before:content-[''] ">
            {/** voting section */}
            <div className="flex flex-col items-center gap-2">
              {/* Upvote */}
              <div onClick={() => sendVote(true)} className={`rounded-full border border-gray-300 cursor-pointer hover:bg-blue-100 ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
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
              <div onClick={() => sendVote(false)} className={`rounded-full border border-gray-300 cursor-pointer hover:bg-blue-100 ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
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

            {/** Content Section */}
            <div className="flex flex-col gap-5">
              <div className="min-h-25">
                <p>
                  {question.content} <br />
                </p>
              </div>
            </div>
          </div>

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

              <AnswerForm questionId={question.questionId} />
            </div>
          ) : (
            <AnswerForm questionId={question.questionId} />
          )}
        </div>
      </div>
    </Card>
  );
}
