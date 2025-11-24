
jest.mock("../services/database", () => ({
    pool: {
        getConnection: jest.fn(),
        execute: jest.fn()
    }
}));

jest.mock("../services/tag-services", () => ({
    isTag: jest.fn(),
    createTag: jest.fn()
}));

jest.mock("../services/answer-services", () => ({
    generateAnswer: jest.fn()
}));

const { pool } = require("../services/database");
const tagService = require("../services/tag-services");
const answerService = require("../services/answer-services");

const QuestionService = require("../services/question-services");

describe("QuestionService", () => {
    let connection;

    beforeEach(() => {
        connection = {
            beginTransaction: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
            release: jest.fn(),
            execute: jest.fn()
        };

        pool.getConnection.mockResolvedValue(connection);
        jest.clearAllMocks();
    });

    describe("createQuestion", () => {
        test("should create a question, process tags, and generate an AI answer", async () => {
            const mockData = {
                title: "Test Title",
                content: "Test body",
                userId: 1,
                courseId: 99,
                isAnonymous: false,
                tags: ["javascript", " node js "]
            };

            connection.execute
                .mockResolvedValueOnce([{ insertId: 123 }]) // insert question
                // Tag processing: isTag() → first: no tag → createTag()
                // second tag exists
                .mockResolvedValueOnce([])                   // QuestionTag insert for tag 1
                .mockResolvedValueOnce([])                   // QuestionTag insert for tag 2
                // SELECT question joined with user + course
                .mockResolvedValueOnce([
                    [{
                        question_id: 123,
                        title: "Test Title",
                        body: "Test body",
                        user_id: 1,
                        course_id: 99,
                        view_count: 0,
                        score: 0,
                        is_anonymous: 0,
                        created_at: "date",
                        updated_at: "date"
                    }]
                ])
                // SELECT tags
                .mockResolvedValueOnce([
                    [
                        { tag_id: 1, name: "javascript" },
                        { tag_id: 2, name: "node js" }
                    ]
                ]);

            // tagService mocks
            tagService.isTag
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(2);

            tagService.createTag.mockResolvedValueOnce(1);

            // Answer service
            answerService.generateAnswer.mockResolvedValue({
                answer_id: 50,
                body: "AI generated answer"
            });

            const result = await QuestionService.createQuestion(mockData);

            expect(pool.getConnection).toHaveBeenCalled();
            expect(connection.beginTransaction).toHaveBeenCalled();
            expect(tagService.createTag).toHaveBeenCalledTimes(1);
            expect(answerService.generateAnswer).toHaveBeenCalled();

            expect(result.questionId).toBe(123);
            expect(result.tags).toHaveLength(2);
            expect(result.answers).toHaveLength(1);
            expect(result.answers[0].body).toBe("AI generated answer");
        });
    });

    describe("getSingleQuestion", () => {
        test("should return question with answers, comments and votes", async () => {
            const questionId = 10;

            // Mock pool.execute
            pool.execute
                // SELECT question
                .mockResolvedValueOnce([
                    [{
                        question_id: questionId,
                        title: "Q",
                        body: "Body",
                        user_id: 1,
                        first_name: "John",
                        last_name: "Doe",
                        view_count: 5,
                        score: 0,
                        is_anonymous: 0,
                        created_at: "date",
                        updated_at: "date",
                        course_id: 100,
                        tags: "js,node"
                    }],
                    [] // fields
                ])
                // UPDATE view_count
                .mockResolvedValueOnce([{}, []])
                // SELECT answers
                .mockResolvedValueOnce([
                    [{
                        answer_id: 1,
                        body: "Answer 1",
                        is_accepted: 0,
                        score: 2,
                        created_at: "date",
                        updated_at: "date",
                        is_anonymous: 0,
                        user_id: 1,
                        first_name: "John",
                        last_name: "Doe"
                    }],
                    []
                ])
                // SELECT question comments
                .mockResolvedValueOnce([[], []])
                // SELECT answer comments
                .mockResolvedValueOnce([[], []]);

            // Mock getVoteCounts
            QuestionService.getVoteCounts = jest.fn()
                .mockResolvedValueOnce({ upVotes: 2, downVotes: 0 }) // for question
                .mockResolvedValueOnce({ upVotes: 1, downVotes: 0 }); // for answer

            const result = await QuestionService.getSingleQuestion({ questionId });

            expect(result.questionId).toBe(questionId);
            expect(result.answers.length).toBe(1);
            expect(result.upVotes).toBe(2);
        });
    });

    describe("getAllQuestions", () => {
        test("returns questions with vote counts", async () => {
            pool.execute.mockResolvedValueOnce([
                [
                    {
                        question_id: 1,
                        title: "Test",
                        body: "Body",
                        user_id: 1,
                        course_id: 100,
                        view_count: 10,
                        score: 0,
                        is_anonymous: 0,
                        created_at: "date",
                        updated_at: "date",
                        answer_count: 1,
                        tags: "js,node"
                    }
                ]
            ]);

            QuestionService.getVoteCounts = jest.fn().mockResolvedValue({
                upVotes: 3,
                downVotes: 1
            });

            const result = await QuestionService.getAllQuestions("");

            expect(result.length).toBe(1);
            expect(result[0].upVotes).toBe(3);
        });
    });

    describe("updateQuestion", () => {
        test("updates and returns updated question", async () => {
            const data = {
                questionId: 10,
                title: "Updated",
                content: "Updated body",
                isAnonymous: false
            };

            pool.execute
                .mockResolvedValueOnce([[{ user_id: 1 }]]) // existing question check
                .mockResolvedValueOnce([{}]); // update

            QuestionService.getSingleQuestion = jest.fn().mockResolvedValue({
                questionId: 10,
                title: "Updated",
                content: "Updated body"
            });

            const result = await QuestionService.updateQuestion(data);
            expect(result.title).toBe("Updated");
        });
    });

    describe("deleteQuestion", () => {
        test("returns success when deleted", async () => {
            pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const result = await QuestionService.deleteQuestion({ questionId: 5 });

            expect(result.success).toBe(true);
        });

        test("returns failure when nothing deleted", async () => {
            pool.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);

            const result = await QuestionService.deleteQuestion({ questionId: 5 });

            expect(result.success).toBe(false);
        });
    });

});
