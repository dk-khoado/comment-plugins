import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { getDatabase } from "database";

export class AuthorList extends OpenAPIRoute {
  schema = {
    tags: ["Authors"],
    summary: "List Authors",
    request: {
      query: z.object({
        page: Num({
          description: "Page number",
          default: 0,
        }).min(0),
        pageSize: Num({
          description: "Number of items per page",
          default: 10,
        }),
      }),
    },
    responses: {
      "200": {
        description: "Returns a list of authors",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                authors: z.array(
                  z.object({
                    id: z.string(),
                    name: z.string().nullable(),
                    email: z.string().nullable(),
                  })
                ),
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
    const { page, pageSize } = data.query;

    // Get the database connection
    const db = getDatabase(c.env);

    // Fetch authors with pagination from the database
    const authors = await db.user.findMany({
      skip: page * pageSize,
      take: pageSize,
    });

    // Return the list of authors
    return {
      success: true,
      result: {
        authors,
      },
    };
  }
}
