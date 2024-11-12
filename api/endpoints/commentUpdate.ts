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
              content: z.string().min(1),
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
      "400": {
        description: "Bad Request",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              error: z.string(),
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

    // Check if the comment exists
    const existingComment = await db.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      return c.json({ success: false, error: "Comment not found" }, 404);
    }
    // Check if the parentId exists if provided
    if (commentToUpdate.parentId) {
      const parentComment = await db.comment.findUnique({
        where: { id: commentToUpdate.parentId },
      });

      if (!parentComment) {
        return c.json(
          { success: false, error: "Parent comment not found" },
          400
        );
      }
    }

    if (commentToUpdate.authorId) {
      // Check if the authorId exists
      const author = await db.user.findUnique({
        where: { id: commentToUpdate.authorId },
      });

      if (!author) {
        return c.json({ success: false, error: "Author not found" }, 400);
      }
    }

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
