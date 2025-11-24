const CommentService = require("../services/comment-services");
const { pool } = require("../services/database");
const genericHelper = require("../helper-functions/generic-helper");


jest.mock("../services/database", () => ({
    pool: { execute: jest.fn() }
}));

jest.mock("../helper-functions/generic-helper", () => ({
    getAIResponse: jest.fn()
}));

beforeEach(() => {
    jest.clearAllMocks();
});

describe("CommentService - createComment", () => {
    test("creates a comment successfully", async () => {
        const fakeInput = {
            body: "Hello world",
            user_id: 2,
            question_id: 5
        };

        pool.execute
            .mockResolvedValueOnce([{ insertId: 10 }])
            .mockResolvedValueOnce([[{ comment_id: 10, body: "Hello world" }]]); // SELECT

        const result = await CommentService.createComment(fakeInput);

        expect(pool.execute).toHaveBeenCalledTimes(2);
        expect(result.comment_id).toBe(10);
    });

    test("throws if body is missing", async () => {
        await expect(
            CommentService.createComment({ user_id: 1, question_id: 5 })
        ).rejects.toThrow("Comment must have a body");
    });

    test("throws if both question_id and answer_id are provided", async () => {
        await expect(
            CommentService.createComment({
                body: "test",
                user_id: 1,
                question_id: 5,
                answer_id: 7
            })
        ).rejects.toThrow(
            "Comment must reference either a question or an answer, not both or neither"
        );
    });

    test("throws if neither question_id nor answer_id is provided", async () => {
        await expect(
            CommentService.createComment({ body: "test", user_id: 1 })
        ).rejects.toThrow(
            "Comment must reference either a question or an answer, not both or neither"
        );
    });

    test("throws if DB returns no rows after insert", async () => {
        pool.execute
            .mockResolvedValueOnce([{ insertId: 10 }])
            .mockResolvedValueOnce([[]]);

        await expect(
            CommentService.createComment({
                body: "test",
                user_id: 1,
                question_id: 5
            })
        ).rejects.toThrow("Failed to create comment");
    });
});

describe("CommentService - getComments", () => {
    test("gets comments by question_id", async () => {
        pool.execute.mockResolvedValueOnce([
            [{ comment_id: 1, body: "hi" }]
        ]);

        const result = await CommentService.getComments({ question_id: 5 });

        expect(pool.execute).toHaveBeenCalledTimes(1);
        expect(result.length).toBe(1);
    });

    test("throws if both or neither IDs provided", async () => {
        await expect(
            CommentService.getComments({})
        ).rejects.toThrow("Must provide exactly one of question_id or answer_id");

        await expect(
            CommentService.getComments({ question_id: 5, answer_id: 7 })
        ).rejects.toThrow("Must provide exactly one of question_id or answer_id");
    });
});

describe("CommentService - updateComment", () => {
    test("updates comment successfully", async () => {
        const fakeInput = {
            comment_id: 10,
            user_id: 2,
            body: "updated text"
        };

        pool.execute
            .mockResolvedValueOnce([[{ user_id: 2 }]])
            .mockResolvedValueOnce([{}])
            .mockResolvedValueOnce([[{ comment_id: 10, body: "updated text" }]]);

        const result = await CommentService.updateComment(fakeInput);

        expect(result.comment_id).toBe(10);
    });

    test("throws if comment not found", async () => {
        pool.execute.mockResolvedValueOnce([[]]); // No rows

        await expect(
            CommentService.updateComment({ comment_id: 10, user_id: 2, body: "x" })
        ).rejects.toThrow("Comment not found");
    });

    test("throws if user is not owner of comment", async () => {
        pool.execute.mockResolvedValueOnce([[{ user_id: 99 }]]);

        await expect(
            CommentService.updateComment({ comment_id: 10, user_id: 2, body: "x" })
        ).rejects.toThrow("Not authorized to edit this comment");
    });
});

describe("CommentService - deleteComment", () => {
    test("successful delete", async () => {
        pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const result = await CommentService.deleteComment({
            comment_id: 10,
            user_id: 2
        });

        expect(result.success).toBe(true);
    });

    test("fails delete (not found or not authorized)", async () => {
        pool.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const result = await CommentService.deleteComment({
            comment_id: 10,
            user_id: 2
        });

        expect(result.success).toBe(false);
    });
});

describe("CommentService - generateAIComment", () => {
    test("AI response is inserted as a comment", async () => {
        genericHelper.getAIResponse.mockResolvedValueOnce({ text: "AI says hi" });

        // createComment mock path
        pool.execute
            .mockResolvedValueOnce([{ insertId: 20 }])
            .mockResolvedValueOnce([[{ comment_id: 20, body: "AI says hi" }]]);

        const result = await CommentService.generateAIComment({
            question_id: 5
        });

        expect(genericHelper.getAIResponse).toHaveBeenCalledTimes(1);
        expect(result.body).toBe("AI says hi");
    });
});
