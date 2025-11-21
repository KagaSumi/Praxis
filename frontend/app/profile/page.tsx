"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../components/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Card from "../../components/Card/Card";
import ViewPostCard from "../../components/ViewPostCard";
import PillButton from "../../components/Card/PillButton";
import { API_BASE_URL } from "../../lib/config";

import { QuestionWithAnswerModel, QuestionWithAnswer } from "../../model/QuestionModel";

export default function ProfilePage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [userQuestions, setUserQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  const questionsCount = userQuestions.length;
  const answersCount = userAnswers.length;

  useEffect(() => {
    async function fetchQuestionsAndUser() {
      setLoading(true);
      try {
        const raw = localStorage.getItem("user");
        const loggedIn = raw ? JSON.parse(raw) : null;
        const userId = loggedIn?.userId ?? loggedIn?.user_id ?? loggedIn?.id ?? null;

        if (!userId) {
          setUserQuestions([]);
          setUserAnswers([]);
          setUser(null);
          setLoading(false);
          return;
        }

        // Get user info for the logged-in user
        const userRes = await fetch(`${API_BASE_URL}/api/users/${userId}`);
        if (userRes.ok) {
          setUser(await userRes.json());
        } else {
          setUser(null);
        }

        // Get all user questions
        const res = await fetch(`${API_BASE_URL}/api/questions`);
        if (!res.ok) throw new Error("Failed to fetch questions");
        const questionsJson: any[] = await res.json();

        const userQuestions = questionsJson.filter((q) => q.userId === userId);

        // Get all user answers
        const answersRes = await fetch(`${API_BASE_URL}/api/users/${userId}/answers`);
        let answersJson: any[] = [];
        if (answersRes.ok) {
          answersJson = await answersRes.json();
        } else {
          answersJson = [];
        }

        setUserQuestions(userQuestions);
        setUserAnswers(answersJson);
      } catch (err) {
        setUserQuestions([]);
        setUserAnswers([]);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestionsAndUser();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        {/* Main Feed */}
        <section className="space-y-6">
          {/* Recent Posts */}
          <Card>
            <div className="flex flex-col gap-4 p-2">
              <h2 className="pl-2 text-xl font-semibold text-slate-900">
                Recent Posts
              </h2>
              <div className="p-1 flex flex-col gap-5">
                {loading ? (
                  <span className="text-slate-500">Loading posts...</span>
                ) : userQuestions.length === 0 ? (
                  <span className="text-slate-500">No posts found.</span>
                ) : (
                  userQuestions.map((p) => (
                    <ViewPostCard
                      key={p.questionId}
                      questionId={p.questionId}
                      title={p.title}
                      tag={(p as any).tags || (p as any).tag || []}
                      content={p.content}
                      username={p.isAnonymous ? "Anonymous" : (user ? `${user.first_name} ${user.last_name}` : "User")}
                      createdAt={p.createdAt}
                      upvote={p.upVotes}
                      views={p.viewCount}
                      replyCount={p.answerCount}
                    />
                  ))
                )}
              </div>
            </div>
          </Card>
          {/* Recent Answers */}
          <Card>
            <div className="flex flex-col gap-4 p-2">
              <h2 className="pl-2 text-xl font-semibold text-slate-900">
                Recent Answers
              </h2>
              <div className="p-1 flex flex-col gap-5">
                {loading ? (
                  <span className="text-slate-500">Loading answers...</span>
                ) : userAnswers.length === 0 ? (
                  <span className="text-slate-500">No answers found.</span>
                ) : (
                  userAnswers.map((a) => (
                    <ViewPostCard
                      key={a.answerId}
                      questionId={a.questionId}
                      title={a.questionTitle}
                      tag={[]}
                      content={a.content}
                      username={a.isAnonymous ? "Anonymous" : (user ? `${user.first_name} ${user.last_name}` : "User")}
                      createdAt={a.createdAt}
                      upvote={a.upVotes}
                      views={0}
                      replyCount={0}
                    />
                  ))
                )}
              </div>
            </div>
          </Card>
        </section>

        {/* Profile Panel */}
        <aside className="w-full lg:w-[320px] flex-shrink-0">
          <div className="bg-white rounded-xl p-6 shadow flex flex-col items-center">
            <div className="w-full text-center">
              <div className="text-base font-semibold text-slate-800 mb-1">
                {user ? `${user.first_name} ${user.last_name}` : "Loading..."}
              </div>
              <div className="text-sm text-gray-500 mb-2">{user ? (user as any).email : ""}</div>
              <div className="flex justify-between text-sm text-slate-700 mb-2">
                <span>Questions {questionsCount}</span>
                <span>Answers {answersCount}</span>
                <span>Reputation {user ? (user as any).score ?? 0 : 0}</span>
              </div>
              <div className="text-sm text-gray-500 mb-2">
                Student no: {user ? (user as any).student_id || "" : ""}
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <PillButton onClick={() => router.push('/profile/edit')}>Edit Details</PillButton>
                <PillButton
                  onClick={() => {
                    localStorage.removeItem("user");//only necessary until JWT tokens are implemented
                    logout();
                    router.push("/");
                  }}
                  style={{ backgroundColor: '#e53e3e' }}
                >
                  Logout
                </PillButton>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}