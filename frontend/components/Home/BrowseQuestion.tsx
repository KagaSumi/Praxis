"use client";
import { useMemo, useState } from "react";

// models
import { Tag, TagModel } from "../../model/Tag";
import { Question } from "../../model/QuestionModel";

// components
import Sidebar from "../Sidebar";
import ViewPostCard from "../ViewPostCard";
import Card from "../Card/Card";
import PillButton from "../Card/PillButton";

export default function BrowseQuestion({
  tags,
  questions,
}: {
  tags: Array<Tag>;
  questions: Array<Question>;
}) {
  const [appliedTags, setAppliedTags] = useState<Set<string>>(new Set());

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const selectedTags = data.getAll("tags") as string[];
    console.log(selectedTags);
    setAppliedTags(new Set(selectedTags));
  }

  const filteredQuestions = useMemo(() => {
    if (appliedTags.size === 0) return questions;

    return questions.filter((question) =>
      question.tags?.some((tag) => appliedTags.has(tag)),
    );
  }, [questions, appliedTags]);

  return (
    <div className="grid gap-6 grid-cols-[260px_1fr]">
      {/* Left Sidebar */}
      <Sidebar>
        <Card>
          <div className="mb-3 text-md font-semibold text-slate-900">
            Filter
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col space-y-2 text-sm  overflow-hidden"
          >
            {/*max-h-[150px]*/}
            {tags.map((tag: Tag) => (
              <label
                key={tag.tag_id}
                className="inline-flex cursor-pointer items-center gap-2"
              >
                <input
                  type="checkbox"
                  name="tags"
                  value={tag.name}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-slate-700">{tag.name}</span>
              </label>
            ))}
            <div className="mt-3">
              <p className="text-slate-700 text-sm underline cursor-pointer">
                Show more filters
              </p>
            </div>

            <div className="mt-4">
              <PillButton type="submit">Apply</PillButton>
            </div>
          </form>
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
              {filteredQuestions.map((q) => (
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
