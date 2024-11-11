import { describe, it, expect, vi } from "vitest";
import { AuthorCreate } from "../endpoints/authorCreate";
import { getDatabase } from "database";
import { Context } from "hono";

// Mock the database
vi.mock("database", () => ({
  getDatabase: vi.fn(),
}));

describe("AuthorCreate Endpoint", () => {
  it("should create a new author successfully", async () => {
    const mockDb = {
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({
          id: "1",
          name: "John Doe",
          email: "john.doe@example.com",
        }),
      },
    };

    getDatabase.mockReturnValue(mockDb);

    const authorCreate = new AuthorCreate();
    const env = { AUTH_TOKEN: "valid-token" };
    const req = new Request("http://localhost/api/authors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "John Doe",
        email: "john.doe@example.com",
      }),
    });

    const context = new Context(req, { env });

    const response = await authorCreate.handle(context);

    expect(response).toEqual({
      success: true,
      author: {
        id: "1",
        name: "John Doe",
        email: "john.doe@example.com",
      },
    });

    expect(mockDb.user.findUnique).toHaveBeenCalledWith({
      where: { email: "john.doe@example.com" },
    });

    expect(mockDb.user.create).toHaveBeenCalledWith({
      data: {
        name: "John Doe",
        email: "john.doe@example.com",
      },
    });
  });

  it("should return an error if the email already exists", async () => {
    const mockDb = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: "1",
          name: "John Doe",
          email: "john.doe@example.com",
        }),
        create: vi.fn(),
      },
    };

    getDatabase.mockReturnValue(mockDb);

    const authorCreate = new AuthorCreate();
    const env = { AUTH_TOKEN: "valid-token" };
    const req = new Request("http://localhost/api/authors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "John Doe",
        email: "john.doe@example.com",
      }),
    });

    const context = new Context(req, { env });

    const response = await authorCreate.handle(context);

    expect(response).toEqual({
      success: false,
      message: "Email already exists",
    });

    expect(mockDb.user.findUnique).toHaveBeenCalledWith({
      where: { email: "john.doe@example.com" },
    });

    expect(mockDb.user.create).not.toHaveBeenCalled();
  });
});
