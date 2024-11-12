import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { getDatabase } from "database";

export class CommentDelete extends OpenAPIRoute {
  schema = {
    tags: ["Comments"],
    summary: "Delete a comment",
    request: {
      params: z.object({
        commentId: z.string().nonempty(),
      }),
    },
    responses: {
      "200": {
        description: "Returns the deletion status",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
            }),
          },
        },
      },
      404: {
        description: "Comment not found",
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

    // Retrieve the validated path parameters
    const { commentId } = data.params;

    // Get the database connection
    const db = getDatabase(c.env);

    // Check if the comment exists
    const existingComment = await db.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      return c.json({ success: false, error: "Comment not found" }, 404);
    }

    // Delete the comment from the database
    await db.comment.delete({
      where: { id: commentId },
    });

    // Return the deletion status
    return c.json({
      success: true,
    });
  }
}
