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
    },
  };

  async handle(c) {
    // Get validated data
    const data = await this.getValidatedData<typeof this.schema>();

    // Retrieve the validated path parameters
    const { commentId } = data.params;

    // Get the database connection
    const db = getDatabase(c.env);

    // Delete the comment from the database
    await db.comment.delete({
      where: { id: commentId },
    });

    // Return the deletion status
    return {
      success: true,
    };
  }
}
