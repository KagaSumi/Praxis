import { z } from "zod";

const CommentModel = z.object({
  comment_id: z.number(),
  question_id: z.number().optional(),
  answer_id: z.number().optional(),
  body: z.string(),
  created_at: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  user_id: z.number(),
});

type Comment = z.infer<typeof CommentModel>;

export { CommentModel };
export type { Comment };
