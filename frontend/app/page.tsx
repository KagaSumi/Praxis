// Packages
import React from "react";
export const dynamic = "force-dynamic";

// Model
import { Question, QuestionModel } from "../model/QuestionModel";
import { Tag, TagModel } from "../model/Tag";

// Components
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../lib/config";
import HomeClient from "../components/HomeClient";
import BrowseQuestion from "../components/Home/BrowseQuestion";
import Sidebar from "../components/Sidebar";
import FilterPanel from "../components/Home/FilterPanel";

export default async function PraxisPage(props: any) {
  const searchParams = props?.searchParams ?? {};
  // questions
  const res = await fetch(`${API_BASE_URL}/api/questions`);
  if (!res.ok) throw new Error("Failed to fetch Question");
  const questions: Array<Question> = await res.json();

  questions.forEach((question) => {
    question.isAnonymous = question.isAnonymous ? true : false;
    console.log(question);
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
        <Sidebar>
          <FilterPanel tags={tags} />
        </Sidebar>

        <BrowseQuestion tags={tags} questions={questions} initialSearch={String(searchParams?.q ?? "")} />

        {/* Right Sidebar (Client Component) */}
        <HomeClient />
      </main>
    </div>
  );
}
