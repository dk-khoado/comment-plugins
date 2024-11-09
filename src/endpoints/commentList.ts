import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Task } from "../types";
import { getDatabase } from "database";

export class CommentList extends OpenAPIRoute {
  schema = {
    tags: ["Tasks"],
    summary: "List Tasks",
    request: {
      //   query: z.object({
      //     page: Num({
      //       description: "Page number",
      //       default: 0,
      //     }),
      //     isCompleted: Bool({
      //       description: "Filter by completed flag",
      //       required: false,
      //     }),
      //   }),
    },
    responses: {
      "200": {
        description: "Returns a list of tasks",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                comments: Task.array(),
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

    const comments = await db.comment.findMany();

    return {
      success: true,
      result: {
        comments,
      },
    };
  }
}
