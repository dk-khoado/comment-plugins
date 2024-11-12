import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Comment } from "../types";
import { getDatabase } from "database";

export class CommentAndAuthorCreate extends OpenAPIRoute {
  schema = {
    tags: ["Comments", "Authors"],
    summary: "Create a new comment and author",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              author: z.object({
                name: z.string().optional(),
                email: z.string().email().optional(),
              }),
              comment: z.object({
                content: z.string(),
                parentId: z.string().optional(),
                postId: z.string().min(1),
                postType: z.string().optional(),
              }),
            }),
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns the created comment and author",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              author: z.object({
                id: z.string(),
                name: z.string().nullable(),
                email: z.string().nullable(),
              }),
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

    // Retrieve the validated request body
    const { author: authorData, comment: commentData } = data.body;

    // Get the database connection
    const db = getDatabase(c.env);

    // Check if the author exists or create a new one
    let author = await db.user.findUnique({
      where: { email: authorData.email },
    });

    if (!author) {
      author = await db.user.create({
        data: {
          name: authorData.name,
          email: authorData.email,
        },
      });
    }

    // Check if the parentId exists if provided
    if (commentData.parentId) {
      const parentComment = await db.comment.findUnique({
        where: { id: commentData.parentId },
      });

      if (!parentComment) {
        return {
          success: false,
          message: "Parent comment does not exist",
        };
      }
      // Check if the parent comment is already a reply (2 levels deep)
      if (parentComment.parentId) {
        return c.json(
          {
            success: false,
            message: "Replies beyond 2 levels deep are not allowed",
          },
          400
        );
      }
    }

    // Save the comment into the database
    const newComment = await db.comment.create({
      data: {
        content: commentData.content,
        authorId: author.id,
        parentId: commentData.parentId,
        postId: commentData.postId,
        postType: commentData.postType,
      },
      include: { author: true },
    });

    // Return the new comment and author
    return {
      success: true,
      author,
      comment: newComment,
    };
  }
}
