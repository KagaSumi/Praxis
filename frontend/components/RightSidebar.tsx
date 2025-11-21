"use client";
import React, { useEffect, useState } from "react";
import Card from "../components/Card/Card";
import Stat from "../components/Card/Stat";
import Link from "next/dist/client/link";
import { useAuth } from "./AuthContext";
import { API_BASE_URL } from "../lib/config";

export default function RightSidebar() {
  const { isLoggedIn, userId } = useAuth();
  const [user, setUser] = useState<any | null>(null);
  const [questionsCount, setQuestionsCount] = useState<number>(0);
  const [answersCount, setAnswersCount] = useState<number>(0);
  const [recentQuestion, setRecentQuestion] = useState<{
    questionId: number;
    title: string;
  } | null>(null);
  const [recentAnswer, setRecentAnswer] = useState<{
    answerId: number;
    content: string;
    questionId: number;
    questionTitle: string;
  } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        if (!isLoggedIn || !userId) return;

        // get user info from backend server
        const userRes = await fetch(`${API_BASE_URL}/api/users/${userId}`);
        const userJson = userRes.ok ? await userRes.json() : null;
        setUser(userJson);

        // fetch all questions, should probably make an endpoint for user stats
        const qRes = await fetch(`${API_BASE_URL}/api/questions`);
        let qJson: any[] = [];
        if (qRes.ok) qJson = await qRes.json();
        const myQuestions = qJson.filter((q) => q.userId === userId);
        setQuestionsCount(myQuestions.length);
        if (myQuestions.length > 0) {
          // choose latest by question
          const sorted = myQuestions
            .slice()
            .sort(
              (a, b) =>
                new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime(),
            );
          setRecentQuestion({
            questionId: sorted[0].questionId,
            title: sorted[0].title,
          });
        } else {
          setRecentQuestion(null);
        }

        const aRes = await fetch(`${API_BASE_URL}/api/users/${userId}/answers`);
        let aJson: any[] = [];
        if (aRes.ok) aJson = await aRes.json();
        setAnswersCount(aJson.length);
        if (aJson.length > 0) {
          const a = aJson[0];
          setRecentAnswer({
            answerId: a.answerId,
            content: a.content,
            questionId: a.questionId,
            questionTitle: a.questionTitle,
          });
        } else {
          setRecentAnswer(null);
        }
      } catch (err) {
        console.error("Failed to load right sidebar data", err);
      }
    }

    load();
  }, [isLoggedIn, userId]);

  if (!isLoggedIn) return null;

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20 space-y-6">
        <Card>
          <div className="flex items-center gap-4">
            <img
              alt={
                user ? `${user.first_name} ${user.last_name}` : "User avatar"
              }
              className="h-16 w-16 rounded-full object-cover"
              src={
                (user && user.avatar) ||
                "https://www.gravatar.com/avatar/?d=mp&s=140"
              }
            />
            <Link href="/profile">
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  {user ? `${user.first_name} ${user.last_name}` : "Loading..."}
                </div>
                <div className="text-xs text-slate-500">
                  {user ? user.email : ""}
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label="Questions" value={questionsCount} />
            <Stat label="Answers" value={answersCount} />
            <Stat label="Reputation" value={user ? (user.score ?? 0) : 0} />
          </div>
        </Card>

        <Card>
          <div className="mb-3 text-sm font-semibold text-slate-900">
            Recent Activity
          </div>
          <div className="space-y-3 text-sm">
            {recentAnswer ? (
              <div>
                <div className="text-slate-500">Answered:</div>
                <Link
                  href={`/question/${recentAnswer.questionId}`}
                  className="text-slate-800 hover:underline"
                >
                  {recentAnswer.content.length > 120
                    ? `${recentAnswer.content.slice(0, 117)}...`
                    : recentAnswer.content}
                </Link>
              </div>
            ) : (
              <div className="text-slate-500">No recent answers</div>
            )}

            {recentQuestion ? (
              <div>
                <div className="text-slate-500">Asked:</div>
                <Link
                  href={`/question/${recentQuestion.questionId}`}
                  className="text-slate-800 hover:underline"
                >
                  {recentQuestion.title.length > 120
                    ? `${recentQuestion.title.slice(0, 117)}...`
                    : recentQuestion.title}
                </Link>
              </div>
            ) : (
              <div className="text-slate-500">No recent questions</div>
            )}
          </div>
        </Card>
      </div>
    </aside>
  );
}
