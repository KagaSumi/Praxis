import { z } from "zod";
import { CommentModel } from "./CommentModel";

const AnswerModel = z.object({
  answerId: z.number(),
  content: z.string(),
  score: z.number(),
  upVotes: z.number(),
  downVotes: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  comments: z.array(CommentModel),
  userId: z.number(),
  isAnonymous: z.boolean(),
  firstname: z.string(),
  lastname: z.string(),
});

type Answer = z.infer<typeof AnswerModel>;

export { AnswerModel };
export type { Answer };
