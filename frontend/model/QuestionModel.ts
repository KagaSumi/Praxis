import { z } from "zod";
import { AnswerModel } from "./AnswerModel";
import { CommentModel } from "./CommentModel";

const QuestionModel = z.object({
  questionId: z.number(),
  title: z.string(),
  content: z.string(),
  userId: z.number(),
  courseId: z.number(),
  viewCount: z.number(),
  upVotes: z.number(),
  downVotes: z.number(),
  isAnonymous: z.boolean(),
  firstname: z.string(),
  lastname: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  answerCount: z.number(),
  tags: z.array(z.string()).optional(),
});

const QuestionWithAnswerModel = z.object({
  questionId: z.number(),
  title: z.string(),
  content: z.string(),
  userId: z.number(),
  courseId: z.number(),
  viewCount: z.number(),
  upVotes: z.number(),
  downVotes: z.number(),
  isAnonymous: z.boolean(),
  firstname: z.string(),
  lastname: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  answers: z.array(AnswerModel),
  tags: z.array(z.string()).optional(),
  comments: z.array(CommentModel).optional(),
});

type Question = z.infer<typeof QuestionModel>;
type QuestionWithAnswer = z.infer<typeof QuestionWithAnswerModel>;

export { QuestionModel, QuestionWithAnswerModel };
export type { Question, QuestionWithAnswer };
