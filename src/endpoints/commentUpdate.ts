import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Comment } from "../types";
import { getDatabase } from "database";

export class CommentUpdate extends OpenAPIRoute {
  schema = {
    tags: ["Comments"],
    summary: "Update a comment",
    request: {
      params: z.object({
        commentId: z.string().min(1),
      }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              content: z.string().optional(),
              authorId: z.string().optional(),
              parentId: z.string().optional(),
              postId: z.string().optional(),
              postType: z.string().optional(),
            }),
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns the updated comment",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              comment: Comment,
            }),
          },
        },
      },
    },
  };

  async handle(c) {
    // Get validated data
    const data = await this.getValidatedData<typeof this.schema>();

    // Retrieve the validated request body and params
    const { commentId } = data.params;
    const commentToUpdate = data.body;

    // Get the database connection
    const db = getDatabase(c.env);

    // Update the comment in the database
    const updatedComment = await db.comment.update({
      where: { id: commentId },
      data: commentToUpdate,
    });

    // Return the updated comment
    return {
      success: true,
      comment: updatedComment,
    };
  }
}
