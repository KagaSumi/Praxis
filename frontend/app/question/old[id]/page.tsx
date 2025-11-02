// url = /question/[id]

import React from "react";

// Auth
import { useAuth } from "../../../components/AuthContext";

// Components
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import Card from "../../../components/Card/Card";
import PillButton from "../../../components/Card/PillButton";
import QACard from "../../../components/QACard";
import Tag from "../../../components/Card/Tag";
import { formatDate } from '../../../helpers/formatDate';

// Models and Types
import { QuestionWithAnswerModel, QuestionWithAnswer } from "../../../model/QuestionModel";
import { Answer } from "../../../model/AnswerModel";

// Enums
import { QA } from "../../../components/QACard";

export default async function QuestionIdPage({
  params,
}: {
  params: { id: string };
}) {
  const res = await fetch(`http://localhost:3000/api/questions/${params.id}`);

  if (!res.ok) throw new Error("Failed to fetch Question");
  const questionJson = await res.json();

  console.log(questionJson);
  questionJson.isAnonymous = !!questionJson.isAnonymous;
  if (Array.isArray(questionJson.answers)) {
    for (let i = 0; i < questionJson.answers.length; i++) {
      questionJson.answers[i].isAnonymous = !!questionJson.answers[i].isAnonymous;
    }
  }
  // validate JSON
  const result = QuestionWithAnswerModel.safeParse(questionJson);
  if (!result.success) {
    console.error(result.error);
    console.log(questionJson);
    throw new Error("Invalid thread data received from API");
  }

  const question: QuestionWithAnswer = result.data;
  const title: string =
    question.title.charAt(0).toUpperCase() + question.title.slice(1);
  const totalVotes: number = question.upVotes - question.downVotes;

  const answers = question.answers;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <Sidebar />

        <div className="flex flex-col gap-5">
          <Card>
            <div className="pl-2 flex flex-col gap-2">
              <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
              <div className="flex flex-row align-center gap-10">
                <p className="text-sm text-slate-500">
                  Asked:{" "}
                  <span className="font-semibold">{formatDate(question.createdAt)}</span>
                </p>
                <p className="text-sm text-slate-500">
                  Modified:{" "}
                  <span className="font-semibold">{formatDate(question.updatedAt)}</span>
                </p>
                <p className="text-sm text-slate-500">
                  Views:{" "}
                  <span className="font-semibold">{question.viewCount}</span>
                </p>
              </div>
              {/** Tags */}
              <div className="mt-3 flex flex-row flex-wrap gap-1">
                {((question as any).tags || (question as any).tag || []).map((t: string) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
              {question.isAnonymous ? (
                <div className="text-sm text-slate-600">Anonymous</div>
              ) : (
                <a
                  href={`/profile/${question.userId}`}
                  className="text-sm text-slate-600 underline "
                >
                  {question.firstname} {question.lastname}
                </a>
              )}
            </div>
          </Card>

          <Card>
            <div className="py-5 px-1 flex flex-col gap-10">
              <QACard
                questionId={question.questionId}
                type={QA.Question}
                content={question.content}
                totalVotes={totalVotes}
              />

              {/** Answer Section */}
              <div className="relative py-10 flex flex-col gap-8">
                <h1 className="pl-2 text-xl text-slate-900 font-semibold before:absolute before:top-0 before:left-0 before:h-[1px] before:w-full before:bg-slate-300 before:content-[''] ">
                  {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
                </h1>
                {answers.map((answer: Answer) => {
                  const answerTotalVotes = answer.upVotes - answer.downVotes;

                  return (
                    <QACard
                      key={answer.answerId}
                      questionId={question.questionId}
                      type={QA.Answer}
                      content={answer.content}
                      totalVotes={answerTotalVotes}
                      createdAt={answer.createdAt}
                      username={answer.isAnonymous ? "Anonymous" : `${answer.firstname} ${answer.lastname}`}
                    />
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
