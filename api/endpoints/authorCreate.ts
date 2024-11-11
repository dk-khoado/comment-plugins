import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { getDatabase } from "database";

export class AuthorCreate extends OpenAPIRoute {
  schema = {
    tags: ["Authors"],
    summary: "Create a new Author",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              name: z.string().optional(),
              email: z.string().email().optional(),
            }),
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns the created author",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              author: z.object({
                id: z.string(),
                name: z.string().nullable(),
                email: z.string().nullable(),
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
    const authorToCreate = data.body;

    // Get the database connection
    const db = getDatabase(c.env);

    // Check if the email is unique
    if (authorToCreate.email) {
      const existingAuthor = await db.user.findUnique({
        where: { email: authorToCreate.email },
      });

      if (existingAuthor) {
        return {
          success: false,
          message: "Email already exists",
        };
      }
    }

    // Create the author in the database
    const newAuthor = await db.user.create({
      data: authorToCreate,
    });

    // Return the new author
    return {
      success: true,
      author: newAuthor,
    };
  }
}
