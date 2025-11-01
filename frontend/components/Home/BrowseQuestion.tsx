"use client";
import { useState } from "react";

// components
import Sidebar from "../Sidebar";
import ViewPostCard from "../ViewPostCard";
import Card from "../Card/Card";
import PillButton from "../Card/PillButton";

//model
import { Question, QuestionModel } from "../../model/QuestionModel";
import { Tag, TagModel } from "../../model/Tag";

export default function BrowseQuestion({ tags, questions }) {
  return (
    <div className="grid gap-6 grid-cols-[260px_1fr]">
      {/* Left Sidebar */}
      <Sidebar>
        <Card>
          <div className="mb-3 text-md font-semibold text-slate-900">
            Filter
          </div>
          <ul className="space-y-2 text-sm h-[150px] overflow-hidden">
            {tags.map((tag) => (
              <li key={tag.tag_id}>
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  <span className="text-slate-700">{tag.name}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <p className="text-slate-700 text-sm underline cursor-pointer">
              Show more filters
            </p>
          </div>

          <div className="mt-4">
            <PillButton>Apply</PillButton>
          </div>
        </Card>
      </Sidebar>

      {/* Main Feed */}
      <section className="space-y-6">
        {/* <Card>
        <div className="flex flex-row gap-3">
          <input
            placeholder="Ask a new question..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-blue-600 focus:ring-2"
          />

          <button
            title="Create a question"
            aria-label="New Question"
            className="hidden rounded-xl border bg-blue-600 border-slate-200 p-2 cursor-pointer hover:bg-blue-700 md:block"
          >
            <svg
              width="30"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </Card> */}{" "}
        {/* hiding this for demo. Eventually should take user input and route to the question/create page with data as title */}
        <Card>
          <div className="flex flex-col gap-4 p-2">
            <h2 className="pl-2 text-xl font-semibold text-slate-900">
              Newest Questions
            </h2>
            <div className="p-1 flex flex-col gap-5">
              {questions.map((q) => (
                <ViewPostCard
                  key={q.questionId}
                  questionId={q.questionId}
                  title={q.title}
                  tag={(q as any).tags || (q as any).tag || []}
                  content={q.content}
                  username={
                    q.isAnonymous ? "Anonymous" : `${q.firstname} ${q.lastname}`
                  }
                  createdAt={q.createdAt}
                  upvote={q.upVotes - q.downVotes}
                  views={q.viewCount}
                  replyCount={q.answerCount}
                />
              ))}
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
