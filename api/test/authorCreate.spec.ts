import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import worker from "../index";
import { env } from "cloudflare:test";

describe("Author API", () => {
  it("should create a new author successfully", async () => {
    const requestBody = {
      name: "John Doe",
      email: "john.doe@example.com",
    };
    const createdAuthor = {
      name: "John Doe",
      email: "john.doe@example.com",
    };

    const res = await worker.request(
      "/api/authors",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
      env
    );
    const response = (await res.json()) as {
      author: { name: string; email: string };
    };

    expect(res.status).toBe(200);
    expect(response.author.name).toEqual(createdAuthor.name);
    expect(response.author.email).toEqual(createdAuthor.email);
  });

  it("should return an error if email already exists", async () => {
    const requestBody = {
      name: "Jane Doe",
      email: "john.doe@example.com", // Same email as the previous test
    };

    await worker.request(
      "/api/authors",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
      env
    );

    const res = await worker.request(
      "/api/authors",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
      env
    );
    const response = (await res.json()) as {
      success: boolean;
      message: string;
    };

    expect(res.status).toBe(200);
    expect(response.success).toBe(false);
    expect(response.message).toBe("Email already exists");
  });

  it("should create an author without a name", async () => {
    const requestBody = {
      email: "jane.doe@example.com",
    };
    const createdAuthor = {
      name: null,
      email: "jane.doe@example.com",
    };

    const res = await worker.request(
      "/api/authors",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
      env
    );
    const response = (await res.json()) as {
      author: { name: string | null; email: string };
    };

    expect(res.status).toBe(200);
    expect(response.author.name).toBeNull();
    expect(response.author.email).toEqual(createdAuthor.email);
  });

  it("should return an error for invalid email format", async () => {
    const requestBody = {
      name: "Invalid Email",
      email: "invalid-email",
    };

    const res = await worker.request(
      "/api/authors",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
      env
    );

    expect(res.status).toBe(400);
  });
});
