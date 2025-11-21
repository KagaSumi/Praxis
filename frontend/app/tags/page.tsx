'use client'
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { API_BASE_URL } from "../../lib/config";
import Card from "../../components/Card/Card";
import ViewPostCard from "../../components/ViewPostCard";
import PillButton from "../../components/Card/PillButton";

export default function TagsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/questions`);
        if (!res.ok) throw new Error("Failed to fetch questions");
        const data = await res.json();
        setPosts(data || []);

        // Extract tags defensively from various possible field names
        const tagSet = new Set<string>();
        (data || []).forEach((q: any) => {
          let tags: any = null;
          if (Array.isArray(q.tags)) tags = q.tags;
          else if (Array.isArray(q.tag)) tags = q.tag;
          else if (typeof q.tags === 'string') tags = q.tags.split(',').map((t: string) => t.trim());
          else if (typeof q.tag === 'string') tags = q.tag.split(',').map((t: string) => t.trim());
          else if (Array.isArray(q.tagNames)) tags = q.tagNames;

          if (tags && Array.isArray(tags)) {
            tags.forEach((t: any) => {
              if (typeof t === 'string' && t.trim()) tagSet.add(t.trim());
              else if (t && typeof t.name === 'string') tagSet.add(t.name.trim());
            });
          }
        });

        setAvailableTags(Array.from(tagSet).sort());
      } catch (err) {
        setPosts([]);
        setAvailableTags([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  function toggleTag(tag: string) {
    const next = new Set(selectedTags);
    if (next.has(tag)) next.delete(tag);
    else next.add(tag);
    setSelectedTags(next);
  }

  // Filter posts: show posts that have ANY of the selected tags (OR behavior). If no tags selected, show nothing or all? We'll show all posts when none selected.
  const filteredPosts = React.useMemo(() => {
    if (selectedTags.size === 0) return posts;
    return posts.filter((q: any) => {
      let tags: any = null;
      if (Array.isArray(q.tags)) tags = q.tags;
      else if (Array.isArray(q.tag)) tags = q.tag;
      else if (typeof q.tags === 'string') tags = q.tags.split(',').map((t: string) => t.trim());
      else if (typeof q.tag === 'string') tags = q.tag.split(',').map((t: string) => t.trim());
      else if (Array.isArray(q.tagNames)) tags = q.tagNames;
      if (!tags) return false;
      const normalized = tags.map((t: any) => (typeof t === 'string' ? t.trim() : (t && t.name) ? t.name.trim() : '')).filter(Boolean);
      for (const s of selectedTags) {
        if (normalized.includes(s)) return true;
      }
      return false;
    });
  }, [posts, selectedTags]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Card>
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Filter by Tags</h2>

            <div>
              <div className="mb-3 text-sm font-semibold text-slate-900">Available tags</div>
              {loading ? (
                <div className="text-slate-500">Loading tags...</div>
              ) : availableTags.length === 0 ? (
                <div className="text-slate-500">No tags found on posts.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleTag(t)}
                      className={`px-3 py-1 rounded-full text-sm font-medium border transition ${selectedTags.has(t) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-800 border-slate-200 hover:bg-blue-50'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-3 text-sm font-semibold text-slate-900">Posts</div>

              {loading ? (
                <div className="text-slate-500 px-4 py-8 text-center">Loading posts...</div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-slate-500 px-4 py-8 text-center">No posts found for selected tags.</div>
              ) : (
                <div className="flex flex-col gap-5">
                  {filteredPosts.map((p: any) => (
                    <ViewPostCard
                      key={p.questionId}
                      questionId={p.questionId}
                      title={p.title}
                      tag={p.tags || p.tag || []}
                      content={p.content || p.body}
                      username={typeof p.userId === 'number' ? String(p.userId) : (p.username || p.user || p.author || 'User')}
                      createdAt={p.createdAt}
                      upvote={p.upVotes || p.upVotes === 0 ? p.upVotes : (p.up_votes || 0)}
                      views={p.viewCount || p.view_count || 0}
                      replyCount={p.answerCount || p.answer_count || 0}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4">
              <PillButton onClick={() => { setSelectedTags(new Set()); }}>Clear filters</PillButton>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
