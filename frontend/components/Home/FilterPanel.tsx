"use client";
import React, { useState } from "react";
import Card from "../Card/Card";
import PillButton from "../Card/PillButton";

export default function FilterPanel({ tags }: { tags: Array<any> }) {
    const [filterExpanded, setFilterExpanded] = useState(false);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const selected = data.getAll("tags").map((v) => String(v));
        try {
            window.dispatchEvent(new CustomEvent("praxis-filter-changed", { detail: selected }));
        } catch (err) {
            // fallback for older browsers
            const ev = document.createEvent("CustomEvent");
            (ev as any).initCustomEvent("praxis-filter-changed", true, true, selected);
            window.dispatchEvent(ev as Event);
        }
    }

    return (
        <Card>
            <div className="mb-3 text-md font-semibold text-slate-900">Filter</div>
            <form onSubmit={handleSubmit} className="flex flex-col text-sm">
                <div
                    className="flex flex-col space-y-2 text-sm overflow-hidden"
                    style={{ maxHeight: filterExpanded ? "fit-content" : "110px" }}
                >
                    {tags.map((tag: any) => (
                        <label key={tag.tag_id} className="inline-flex cursor-pointer items-center gap-2">
                            <input
                                type="checkbox"
                                name="tags"
                                value={tag.name}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                            />
                            <span className="text-slate-700">{tag.name}</span>
                        </label>
                    ))}
                </div>

                {tags.length > 5 ? (
                    <div className="mt-3">
                        <p className="text-slate-700 text-sm underline cursor-pointer" onClick={() => setFilterExpanded((p) => !p)}>
                            {filterExpanded ? "Show less filters" : "Show more filters"}
                        </p>
                    </div>
                ) : null}

                <div className="mt-4">
                    <PillButton type="submit">Apply</PillButton>
                </div>
            </form>
        </Card>
    );
}
