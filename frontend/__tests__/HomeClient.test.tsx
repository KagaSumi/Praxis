/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";

import RightSidebar from "../components/RightSidebar";
import { useAuth } from "../components/AuthContext";

vi.mock("../components/AuthContext", () => {
  return {
    useAuth: vi.fn(),
  };
});

describe("HomeClient", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("returns null when not logged in", () => {
    (useAuth as any).mockReturnValue({
      isLoggedIn: false,
      userId: null,
    });

    const { container } = render(<RightSidebar />);
    expect(container.firstChild).toBeNull();
  });

  it("loads and displays user info", async () => {
    (useAuth as any).mockReturnValue({
      isLoggedIn: true,
      userId: 1,
    });

    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          first_name: "Seungjae",
          last_name: "Baek",
          email: "SJB@example.com",
          avatar: "/pic.png",
          score: 50,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            userId: 1,
            questionId: 100,
            title: "Latest",
            createdAt: "2025-03-10",
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            answerId: 9,
            questionId: 55,
            content: "My answer hello!",
            questionTitle: "React question",
          },
        ],
      });

    render(<RightSidebar />);

    expect(await screen.findByText("Seungjae Baek")).toBeInTheDocument();
    expect(screen.getByText("SJB@example.com")).toBeInTheDocument();
  });
});
