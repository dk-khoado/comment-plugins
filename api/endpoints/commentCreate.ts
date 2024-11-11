import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Comment } from "../types";
import { getDatabase } from "database";

export class CommentCreate extends OpenAPIRoute {
  schema = {
    tags: ["Comments"],
    summary: "Create a new comment",
    request: {
      body: {
        content: {
          "application/json": {
            schema: Comment,
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns the created task",
        content: {
          "application/json": {
            schema: z.object({
              series: z.object({
                success: Bool(),
                result: z.object({
                  task: Comment,
                }),
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

    // Retrieve the validated request body
    const commentToCreate = data.body;

    // Get the database connection
    const db = getDatabase(c.env);

    // Check if the authorId exists
    const author = await db.user.findUnique({
      where: { id: commentToCreate.authorId },
    });

    if (!author) {
      return {
        success: false,
        message: "Author does not exist",
      };
    }

    // Check if the parentId exists if provided
    if (commentToCreate.parentId) {
      const parentComment = await db.comment.findUnique({
        where: { id: commentToCreate.parentId },
      });

      if (!parentComment) {
        return {
          success: false,
          message: "Parent comment does not exist",
        };
      }
    }

    // Save the comment into the database
    const newComment = await db.comment.create({
      data: {
        content: commentToCreate.content,
        authorId: commentToCreate.authorId as string, // Ensure authorId is a string
        parentId: commentToCreate.parentId,
        postId: commentToCreate.postId,
        postType: commentToCreate.postType,
      },
    });

    // return the new comment
    return {
      success: true,
      comment: newComment,
    };
  }
}
