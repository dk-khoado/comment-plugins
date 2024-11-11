import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Comment } from "../types";
import { getDatabase } from "database";

export class CommentsByPostId extends OpenAPIRoute {
  schema = {
    tags: ["Comments"],
    summary: "Get all comments by postId",
    request: {
      params: z.object({
        postId: z.string().nonempty(),
      }),
    },
    responses: {
      "200": {
        description: "Returns a list of comments for the specified postId",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                comments: Comment.array(),
              }),
            }),
          },
        },
      },
    },
  };

  async handle(c) {
    // Get validated data
    const data = await this.getValidatedData<typeof this.schema>();

    // Retrieve the validated query parameters
    const { postId } = data.params;

    // Get the database connection
    const db = getDatabase(c.env);

    // Fetch comments by postId from the database
    const comments = await db.comment.findMany({
      where: { postId },
      include: { author: true },
      orderBy: { createdAt: "desc" },
    });

    // Return the list of comments
    return {
      success: true,
      result: {
        comments,
      },
    };
  }
}
