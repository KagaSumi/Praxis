import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ViewPostCard from "../components/ViewPostCard";
import { vi } from "vitest";
import { formatDate } from "../helpers/formatDate";

describe("ViewPostCard", () => {
  const dummyProps = {
    questionId: 1,
    title: "Question Title",
    tag: ["tag1", "tag2"],
    username: "User1",
    content: "Content",
    createdAt: "2025-11-20T20:22:00Z",
    upvote: 5,
    views: 50,
    replyCount: 3,
  };

  it("Renders title, content and metadata visible", () => {
    render(<ViewPostCard {...dummyProps} />);
    expect(screen.getByText(dummyProps.title)).toBeInTheDocument();
    expect(screen.getByText(dummyProps.username)).toBeInTheDocument();
    expect(
      screen.getByText(formatDate(dummyProps.createdAt)),
    ).toBeInTheDocument();
    expect(screen.getByText(dummyProps.content)).toBeInTheDocument();
  });

  it("renders reply, view, upvote counts", () => {
    render(<ViewPostCard {...dummyProps} />);
    expect(screen.getByText(/3 replies/)).toBeInTheDocument();
    expect(screen.getByText(/5 upvotes/)).toBeInTheDocument();
    expect(screen.getByText(/50 views/)).toBeInTheDocument();
  });

  it("navigates to the correct question when clicking title", () => {
    render(<ViewPostCard {...dummyProps} />);
    const link = screen.getByRole("link", { name: dummyProps.title });
    expect(link).toHaveAttribute("href", `/question/${dummyProps.questionId}`);
  });

  it("renders tags", () => {
    render(<ViewPostCard {...dummyProps} />);
    dummyProps.tag.forEach((t) => {
      expect(screen.getByText(t)).toBeInTheDocument();
    });
  });
});
