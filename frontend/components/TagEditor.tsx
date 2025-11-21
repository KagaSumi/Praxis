"use client";
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../lib/config";

export default function TagEditor({
    value,
    onChange,
    placeholder = "e.g. arrays sorting dp",
}: {
    value: string[];
    onChange: (next: string[]) => void;
    placeholder?: string;
}) {
    const [input, setInput] = useState("");
    const [availableTags, setAvailableTags] = useState<Array<{ tag_id: number; name: string }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/tags`);
                if (!res.ok) throw new Error("Failed to fetch tags");
                const data = await res.json();
                const normalized = (data || []).map((t: any) => ({ tag_id: t.tag_id ?? t.id ?? t.tagId, name: (t.name ?? "").toString() }));
                if (mounted) setAvailableTags(normalized);
            } catch (e) {
                if (mounted) setAvailableTags([]);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, []);

    function addFromInput(raw: string) {
        const parts = raw
            .split(/\s+/)
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
        if (parts.length === 0) return;
        onChange(Array.from(new Set([...value.map(v => v.toLowerCase()), ...parts])));
        setInput("");
    }

    function addTag(name: string) {
        const n = name.trim().toLowerCase();
        if (!n) return;
        if (value.map(v => v.toLowerCase()).includes(n)) return;
        onChange([...value, n]);
        setInput("");
    }

    function removeTag(name: string) {
        const n = name.trim().toLowerCase();
        onChange(value.filter((v) => v.toLowerCase() !== n));
    }

    const suggestions = (() => {
        const q = input.trim().toLowerCase();
        if (!q) return [] as Array<{ id: number; name: string }>;
        return availableTags
            .map((t) => ({ id: t.tag_id, name: t.name }))
            .filter((t) => t.name.toLowerCase().includes(q) && !value.map(v => v.toLowerCase()).includes(t.name.toLowerCase()));
    })();

    return (
        <div>
            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addFromInput(input);
                        }
                    }}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 text-white px-3 py-1 text-sm hover:bg-blue-700"
                    onClick={() => addFromInput(input)}
                >
                    Add
                </button>

                {!loading && suggestions.length > 0 && (
                    <ul className="absolute z-20 mt-2 w-full max-h-52 overflow-auto rounded-md border bg-white shadow">
                        {suggestions.map((s) => (
                            <li
                                key={s.id}
                                className="px-3 py-2 hover:bg-slate-100 cursor-pointer text-sm"
                                onClick={() => addTag(s.name)}
                            >
                                {s.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Selected tags */}
            {value.length > 0 && (
                <div className="mt-3 flex flex-row flex-wrap gap-2">
                    {value.map((t) => (
                        <span key={t} className="inline-flex items-center gap-2 px-2 py-1 rounded-full border border-slate-300 bg-white text-sm">
                            {t}
                            <button
                                type="button"
                                className="text-slate-500 hover:text-slate-700"
                                onClick={() => removeTag(t)}
                                aria-label={`Remove tag ${t}`}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
