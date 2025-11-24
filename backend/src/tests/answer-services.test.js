
const AnswerService = require("../services/answer-services");
const { pool } = require("../services/database");
const genericHelper = require("../helper-functions/generic-helper");


jest.mock("../services/database", () => ({
    pool: {
        execute: jest.fn(),
        getConnection: jest.fn()
    }
}));

jest.mock("../helper-functions/generic-helper", () => ({
    getAIResponse: jest.fn()
}));

describe("AnswerService - Core Functionality", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // --- createAnswer ---
    test("createAnswer - successfully creates an answer", async () => {
        pool.execute
            .mockResolvedValueOnce([{ insertId: 10 }, []])
            .mockResolvedValueOnce([[{
                answer_id: 10, body: "Hello", is_accepted: 0, score: 0,
                created_at: "now", updated_at: "now", is_anonymous: 0,
                user_id: 1, first_name: "John", last_name: "Doe",
                question_id: 2, title: "Title"
            }], []])
            .mockResolvedValueOnce([[{ up_votes: 2, down_votes: 1 }], []]);

        const result = await AnswerService.createAnswer({
            body: "Hello",
            question_id: 2,
            user_id: 1,
            is_anonymous: false
        });

        expect(result.answerId).toBe(10);
    });

    test("createAnswer - fails if inserted answer cannot be retrieved", async () => {
        pool.execute
            .mockResolvedValueOnce([{ insertId: 10 }, []])
            .mockResolvedValueOnce([[], []]); // no returned rows

        await expect(
            AnswerService.createAnswer({ body: "X", question_id: 1, user_id: 1 })
        ).rejects.toThrow("Failed to create answer");
    });

    // --- getOneAnswer ---
    test("getOneAnswer - returns answer details", async () => {
        pool.execute
            .mockResolvedValueOnce([[{
                answer_id: 5, body: "Test", is_accepted: 0, score: 0,
                created_at: "now", updated_at: "now", is_anonymous: 0,
                user_id: 1, first_name: "A", last_name: "B",
                question_id: 10, title: "Q Title"
            }], []])
            .mockResolvedValueOnce([[{ up_votes: 1, down_votes: 0 }], []])
            .mockResolvedValueOnce([[{ body: "Comment 1" }], []]);

        const result = await AnswerService.getOneAnswer({ answerId: 5 });

        expect(result.answerId).toBe(5);
        expect(result.comments.length).toBe(1);
    });

    test("getOneAnswer - fails if answer not found", async () => {
        pool.execute.mockResolvedValueOnce([[], []]);

        await expect(
            AnswerService.getOneAnswer({ answerId: 999 })
        ).rejects.toThrow("Answer ID doesn't exist!");
    });

    // --- updateAnswer ---
    test("updateAnswer - updates and returns updated answer", async () => {
        pool.execute
            .mockResolvedValueOnce([[{ user_id: 1 }], []])
            .mockResolvedValueOnce([{}, []]);

        AnswerService.getOneAnswer = jest.fn().mockResolvedValue({ answerId: 20 });

        const result = await AnswerService.updateAnswer({
            answerId: 20,
            content: "Updated",
            is_anonymous: false
        });

        expect(result.answerId).toBe(20);
    });

    test("updateAnswer - fails if answer does not exist", async () => {
        pool.execute.mockResolvedValueOnce([[], []]);

        await expect(
            AnswerService.updateAnswer({ answerId: 5, content: "X" })
        ).rejects.toThrow("Answer ID doesn't exist!");
    });

    // --- deleteAnswer ---
    test("deleteAnswer - deletes successfully", async () => {
        pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

        const result = await AnswerService.deleteAnswer({ answerId: 3 });

        expect(result.success).toBe(true);
    });

    test("deleteAnswer - fails when not found", async () => {
        pool.execute.mockResolvedValueOnce([{ affectedRows: 0 }, []]);

        const result = await AnswerService.deleteAnswer({ answerId: 3 });

        expect(result.success).toBe(false);
    });

    test("deleteAnswer - DB error", async () => {
        pool.execute.mockRejectedValueOnce(new Error("SQL error"));

        await expect(
            AnswerService.deleteAnswer({ answerId: 1 })
        ).rejects.toThrow("SQL error");
    });

    // --- generateAnswer ---
    test("generateAnswer - AI generates + creates answer", async () => {
        genericHelper.getAIResponse.mockResolvedValue({ text: "AI Answer" });

        AnswerService.createAnswer = jest.fn().mockResolvedValue({ answerId: 77 });

        const result = await AnswerService.generateAnswer({
            question_id: 99
        });

        expect(result.answerId).toBe(77);
    });

    test("generateAnswer - fails if AI service fails", async () => {
        genericHelper.getAIResponse.mockRejectedValueOnce(new Error("AI failed"));

        await expect(
            AnswerService.generateAnswer({ question_id: 10 })
        ).rejects.toThrow("AI failed");
    });
});
