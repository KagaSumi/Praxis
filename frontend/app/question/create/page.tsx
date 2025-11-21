'use client'
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { API_BASE_URL } from "../../../lib/config";
import Card from "../../../components/Card/Card";
import PillButton from "../../../components/Card/PillButton";
import TagEditor from "../../../components/TagEditor";

export default function CreateQuestionPage() {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [anonymous, setAnonymous] = useState(false);
    const [course, setCourse] = useState("");
    const [courses, setCourses] = useState<Array<{ course_id: number; name: string }>>([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const router = useRouter();

    // Fetch courses from DB
    useEffect(() => {
        async function fetchCourses() {
            setCoursesLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/courses`);
                if (!res.ok) throw new Error("Failed to fetch courses");
                const data = await res.json();
                const normalized = data.map((c: any) => ({
                    course_id: c.course_id ?? c.id ?? c.courseId,
                    name: c.name ?? c.title ?? c.code ?? "Unnamed Course",
                }));
                setCourses(normalized);

                // Optional: print retrieved courses for debugging
                console.log("Create Question - Courses from DB:", normalized);
                console.table(normalized);
            } catch (err) {
                console.error("Error loading courses:", err);
                setCourses([]);
            } finally {
                setCoursesLoading(false);
            }
        }
        fetchCourses();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ensure a course is selected
        if (!course) {
            alert("Please select a course.");
            return;
        }

        try {
            const numericCourseId = Number(course);//need to do this until course backend stuff is ready
            const storedUser = localStorage.getItem("user");//use local storage until user JWT tokens are implemented
            const parsedUser = storedUser ? JSON.parse(storedUser) : null;
            const userId = parsedUser?.userId;
            if (!userId) {
                alert("You must be signed in to post a question.");
                return;
            }
            const res = await fetch(`${API_BASE_URL}/api/questions/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    content: body,
                    userId,
                    courseId: numericCourseId,
                    isAnonymous: anonymous,
                    tags: selectedTags,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.message || "Failed to create question.");
                return;
            }

            const data = await res.json();
            // Redirect to the new question page
            console.log("Question created with ID:", data);
            if (data && data.questionId) {
                router.push(`/question/${data.questionId}`);
            } else {
                alert("Question posted, but could not get question ID.");
            }
        } catch (err) {
            alert("Network error. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="mx-auto max-w-2xl px-4 py-10">
                <Card>
                    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                            Ask a New Question
                        </h2>
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Title
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Enter your question title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        {/* Body */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Body
                            </label>
                            <textarea
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Describe your question in detail"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                required
                            />
                        </div>
                        {/* Course */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Course
                            </label>
                            <select
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 outline-none"
                                value={course}
                                onChange={(e) => setCourse(e.target.value)}
                                required
                            >
                                <option value="">{coursesLoading ? "Loading courses..." : "Select a course"}</option>
                                {!coursesLoading && courses.map((c) => (
                                    <option key={c.course_id} value={c.course_id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-col gap-3">
                            <label className="block text-sm font-medium text-slate-700">
                                Tags
                            </label>
                            <TagEditor value={selectedTags} onChange={setSelectedTags} placeholder="Start typing to see matching existing tags" />
                        </div>
                        {/* Anonymous option */}
                        <div className="flex items-center gap-2">
                            <input
                                id="anonymous"
                                type="checkbox"
                                checked={anonymous}
                                onChange={(e) => setAnonymous(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="anonymous" className="text-sm text-slate-700">
                                Post anonymously
                            </label>
                        </div>
                        {/* Submit */}
                        <div>
                            <PillButton type="submit">Post Question</PillButton>
                        </div>
                    </form>
                </Card>
            </main>
        </div>
    );
}
