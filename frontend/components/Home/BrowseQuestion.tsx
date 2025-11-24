"use client";
import { useMemo, useState, useEffect } from "react";

// models
import { Tag, TagModel } from "../../model/Tag";
import { Question } from "../../model/QuestionModel";

// components
import ViewPostCard from "../ViewPostCard";
import Card from "../Card/Card";

export default function BrowseQuestion({
  tags,
  questions,
  initialSearch = "",
}: {
  tags: Array<Tag>;
  questions: Array<Question>;
  initialSearch?: string;
}) {
  const [appliedTags, setAppliedTags] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || "");
  const [filterExpanded, setfilterExpanded] = useState<boolean>(false);

  useEffect(() => {
    // console.debug("BrowseQuestion: initialSearch=", initialSearch);

    if ((initialSearch || "").trim().length === 0) {
      try {
        // Prefer explicit URL `q` param when present (client navigations may include it)
        const params = new URLSearchParams(window.location.search || "");
        const urlQ = params.get("q") || "";
        const stored = localStorage.getItem("praxis-search") || "";
        const use = (urlQ && urlQ.trim().length > 0) ? urlQ : stored;
        // console.debug("BrowseQuestion: urlQ=", urlQ, " stored=", stored);
        if (use && use.trim().length > 0) {
          setSearchQuery(use);
        }
      } catch (e) {
        // ignore localStorage errors
      }
    } else {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  // Listen for search changes dispatched from Navbar (same-tab) or storage events (other tabs)
  useEffect(() => {
    function onPraxisSearchChanged(e: Event) {
      try {
        const detail = (e as CustomEvent).detail;
        const v = typeof detail === "string" ? detail : "";
        console.debug("BrowseQuestion: praxis-search-changed event=", v);
        setSearchQuery(v || "");
      } catch (err) {
        // ignore
      }
    }

    function onStorage(e: StorageEvent) {
      if (e.key === "praxis-search") {
        console.debug("BrowseQuestion: storage event newValue=", e.newValue);
        setSearchQuery(e.newValue || "");
      }
    }

    window.addEventListener("praxis-search-changed", onPraxisSearchChanged as EventListener);
    window.addEventListener("storage", onStorage as EventListener);

    return () => {
      window.removeEventListener("praxis-search-changed", onPraxisSearchChanged as EventListener);
      window.removeEventListener("storage", onStorage as EventListener);
    };
  }, []);

  // Listen for tag filter changes dispatched from page-level FilterPanel
  useEffect(() => {
    function onFilterChanged(e: Event) {
      try {
        const detail = (e as CustomEvent).detail as string[];
        setAppliedTags(new Set(detail || []));
      } catch (err) {
      }
    }

    window.addEventListener("praxis-filter-changed", onFilterChanged as EventListener);
    return () => window.removeEventListener("praxis-filter-changed", onFilterChanged as EventListener);
  }, []);

  // If the user navigates to the home path with no `q` param, clear any stored search.
  useEffect(() => {
    function clearIfHomeNoQuery() {
      try {
        const params = new URLSearchParams(window.location.search || "");
        const q = params.get("q") || "";
        const path = window.location.pathname || "/";
        if ((path === "/" || path === "") && (!q || q.trim().length === 0)) {
          try {
            localStorage.removeItem("praxis-search");
          } catch (err) {
          }
          setSearchQuery("");
          try {
            const evt = new CustomEvent("praxis-search-changed", { detail: "" });
            window.dispatchEvent(evt as Event);
          } catch (err) {
          }
        }
      } catch (err) {
      }
    }

    // run on mount
    clearIfHomeNoQuery();

    // also run on popstate (back/forward)
    window.addEventListener("popstate", clearIfHomeNoQuery);
    return () => window.removeEventListener("popstate", clearIfHomeNoQuery);
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const selectedTags = data.getAll("tags") as string[];
    console.log(selectedTags);
    setAppliedTags(new Set(selectedTags));
  }

  const filteredQuestions = useMemo(() => {
    // start with full list
    let out = questions;

    // apply tag filters
    if (appliedTags.size > 0) {
      out = out.filter((question) =>
        question.tags?.some((tag) => appliedTags.has(tag)),
      );
    }

    // apply search query (title, content or tags)
    const q = (searchQuery || "").trim().toLowerCase();
    if (q.length === 0) return out;
    const terms = q.split(/\s+/).filter(Boolean);

    return out.filter((question) => {
      const title = (question.title || "").toLowerCase();
      const content = (question.content || "").toLowerCase();
      const tagsLower = (question.tags || []).map((t) => t.toLowerCase());

      return terms.every((term) =>
        title.includes(term) || content.includes(term) || tagsLower.some((t) => t.includes(term)),
      );
    });
  }, [questions, appliedTags, searchQuery]);

  return (
    <section className="min-w-0 space-y-6">
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
        </Card>{" "} */}
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
  );
}
