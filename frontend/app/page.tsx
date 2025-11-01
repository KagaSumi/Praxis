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
import BrowseQuestion from "../components/Home/BrowseQuestion";

export default async function PraxisPage() {
  // questions
  const res = await fetch("http://localhost:3000/api/questions");
  if (!res.ok) throw new Error("Failed to fetch Question");
  const questions: Array<Question> = await res.json();

  questions.forEach((question) => {
    question.isAnonymous = question.isAnonymous ? true : false;
    const parseResult = QuestionModel.safeParse(question);
    if (!parseResult.success) {
      console.error(parseResult.error);
      throw new Error("Invalid question data received from API");
    }
  });

  // tags
  const tagRes = await fetch("http://localhost:3000/api/tags", {
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
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        <BrowseQuestion tags={tags} questions={questions} />
        {/* Right Sidebar (Client Component) */}
        <HomeClient />
      </main>
    </div>
  );
}
