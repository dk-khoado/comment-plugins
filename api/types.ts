import { Comment as CommentModel } from "@prisma/client";
import { DateTime, Str } from "chanfana";
import { z } from "zod";

export const Comment = z.object({
  content: Str({ required: true }),
  authorId: Str({ required: true }),
  parentId: Str().optional(),
  postId: Str().optional(),
  postType: Str().optional(),
});
