import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Comment } from "../types";
import { getDatabase } from "database";

export class CommentList extends OpenAPIRoute {
  schema = {
    tags: ["Comments"],
    summary: "List Comments",
    request: {
      query: z.object({
        page: Num({
          description: "Page number",
          default: 0,
        }),
        pageSize: Num({
          description: "Number of items per page",
          default: 10,
        }),
      }),
    },
    responses: {
      "200": {
        description: "Returns a list of tasks",
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

    const db = getDatabase(c.env);

    const comments = await db.comment.findMany({
      skip: data.query.page * data.query.pageSize,
      take: data.query.pageSize,
      include: {
        replies: true,
        author: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    return {
      success: true,
      result: {
        comments,
      },
    };
  }
}
