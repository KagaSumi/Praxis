// Packages
import React from "react";

// Model
import { Question, QuestionModel } from "../model/QuestionModel";
import { Tag, TagModel } from "../model/Tag";

// Components
import ViewPostCard from "../components/ViewPostCard";
import Card from "../components/Card/Card";
import Navbar from "../components/Navbar";
import PillButton from "../components/Card/PillButton";
import Stat from "../components/Card/Stat";
import HomeClient from "../components/HomeClient";
import Sidebar from "../components/Sidebar";
import { API_BASE_URL } from "../lib/config";

export default async function PraxisPage() {
  // questions
  const res = await fetch(`${API_BASE_URL}/api/questions`);
  if (!res.ok) throw new Error("Failed to fetch Question");
  const questionsJson: Array<Question> = await res.json();

  questionsJson.forEach((question) => {
    question.isAnonymous = question.isAnonymous ? true : false;
    const parseResult = QuestionModel.safeParse(question);
    if (!parseResult.success) {
      console.error(parseResult.error);
      throw new Error("Invalid question data received from API");
    }
  });

  // tags
  const tagRes = await fetch(`${API_BASE_URL}/api/tags`, {
    method: "GET",
  });
  if (!tagRes.ok) throw new Error("Failed to fetch tags");
  const tags: Array<Tag> = await tagRes.json();

  tags.forEach((tag) => {
    const parseResult = TagModel.safeParse(tag);
    if (!parseResult.success) {
      console.error(parseResult.error);
      throw new Error("Invalid tag data received from API");
    }
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <Navbar />

      {/* Content */}
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr_320px] lg:px-8">
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
                {questionsJson.map((q) => (
                  <ViewPostCard
                    key={q.questionId}
                    questionId={q.questionId}
                    title={q.title}
                    tag={(q as any).tags || (q as any).tag || []}
                    content={q.content}
                    username={
                      q.isAnonymous
                        ? "Anonymous"
                        : `${q.firstname} ${q.lastname}`
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

        {/* Right Sidebar (Client Component) */}
        <HomeClient />
      </main>
    </div>
  );
}
