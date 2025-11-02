import React from "react";

import Link from "next/link";
import Card from "./Card/Card";
import Tag from "./Card/Tag";
import PillButton from "./Card/PillButton";
import { formatDate } from '../helpers/formatDate';

export default function ViewPostCard({
  questionId,
  title,
  tag,
  username,
  content,
  createdAt,
  upvote,
  views,
  replyCount,
}: {
  questionId: number;
  title: string;
  tag: string[];
  username: string;
  content: string;
  createdAt: string;
  upvote: number;
  views: number;
  replyCount: number;
}) {
  const questionUrl = `/question/${questionId}`;

  return (
    <Card>
      {/** Header */}
      <div className="mb-2 flex items-start justify-between gap-4">
        <Link href={{ pathname: `/question/${questionId}` }}>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        </Link>
      </div>
      <div className="mb-3 text-xs text-slate-500">
        <span className="font-medium text-slate-700">{username}</span>
        <span className="mx-2">•</span>
        <span>{formatDate(createdAt)}</span>
      </div>

      {/** Content */}
      <p className="text-sm text-slate-700">{content}</p>

      {/** Tags */}
      <div className="mt-3 flex flex-row flex-wrap gap-1">
        {tag.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>

      {/** Footer */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-5 text-sm text-slate-600">
          {/** Reply count */}
          <span className="inline-flex items-center gap-1">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
            </svg>
            {replyCount} replies
          </span>

          {/** Upvote count */}
          <span className="inline-flex items-center gap-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="27px"
              viewBox="0 -960 960 960"
              width="27px"
              fill="currentColor"
            >
              <path d="m280-400 200-200 200 200H280Z" />
            </svg>
            {upvote} upvotes
          </span>

          {/** View count */}
          <span className="inline-flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="18px"
              viewBox="0 -960 960 960"
              width="18px"
              fill="currentColor"
            >
              <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
            </svg>
            <p>{views} views</p>
          </span>
        </div>

        {/** Answer button */}
        <Link href={questionUrl}>
          <PillButton>Answer</PillButton>
        </Link>
      </div>
    </Card>
  );
}
