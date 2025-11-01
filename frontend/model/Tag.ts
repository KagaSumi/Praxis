import { z } from "zod";

const TagModel = z.object({
  tag_id: z.number(),
  name: z.string(),
});

type Tag = z.infer<typeof TagModel>;

export { TagModel };
export type { Tag };
