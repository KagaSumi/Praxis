"use client";

import { useState } from "react";

// component
import Card from "../Card";
import Tag from "../Tag";
import TagEditor from "../../TagEditor";
import { formatDate } from "../../../helpers/formatDate";

// model
import { QuestionWithAnswer } from "../../../model/QuestionModel";

export default function QuestionEdit({
  question,
  onSave,
  onCancel,
}: {
  question: QuestionWithAnswer;
  onSave: (question: QuestionWithAnswer) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(question.title);
  const [content, setContent] = useState(question.content);
  const [isAnonymous, setIsAnonymous] = useState(
    (question as any).isAnonymous ?? false,
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    const t = (question as any).tags || (question as any).tag || [];
    return Array.isArray(t)
      ? t.map((s: string) => s.toString().toLowerCase())
      : [];
  });

  const totalVotes = question.upVotes - question.downVotes;

  function removeSelectedTag(tagName: string) {
    const name = tagName.trim().toLowerCase();
    setSelectedTags((prev) => prev.filter((t) => t !== name));
  }

  return (
    <div className="flex flex-col gap-5">
      {/* header section */}
      <Card>
        <div className="pl-2 flex flex-col gap-2">
          {/* title turns into input box */}
          <input
            type="text"
            name="title"
            id="title"
            className="text-2xl font-semibold text-slate- border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none rounded-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* post information */}
          <div className="flex flex-row align-center gap-10">
            <p className="text-sm text-slate-500">
              Asked:{" "}
              <span className="font-semibold">
                {formatDate(question.createdAt)}
              </span>
            </p>
            <p className="text-sm text-slate-500">
              Modified:{" "}
              <span className="font-semibold">
                {formatDate(question.updatedAt)}
              </span>
            </p>
            <p className="text-sm text-slate-500">
              Views: <span className="font-semibold">{question.viewCount}</span>
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
            {/* anonymous checkbox when editing */}
            <div className="flex items-center gap-2">
              <input
                id="question-anonymous"
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4"
              />
              <label
                htmlFor="question-anonymous"
                className="text-sm text-slate-600"
              >
                Post anonymously
              </label>
            </div>
          </div>

          {/** Tags */}
          <div className="mt-3 w-full">
            <TagEditor
              value={selectedTags}
              onChange={setSelectedTags}
              placeholder="Add tags (press Enter to add)"
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-5 p-3">
          <div className="grid grid-cols-[50px_1fr] gap-5">
            {/** Upvote / Downvote */}
            <div className="flex flex-col items-center gap-2">
              {/* Upvote */}
              <div className="rounded-full border border-gray-300 cursor-pointer hover:bg-blue-100">
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
              <p className="text-xl">{totalVotes}</p>
              {/* Downvote */}
              <div className="rounded-full border border-gray-300 cursor-pointer hover:bg-blue-100">
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
                <textarea
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className=" text-slate-500 text-sm flex flex-row gap-2 pl-2">
            <form
              className="flex flex-row gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                question.title = title;
                question.content = content;
                (question as any).isAnonymous = isAnonymous;
                (question as any).tags = selectedTags;
                onSave(question);
              }}
            >
              <button
                type="submit"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="cursor-pointer"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}
