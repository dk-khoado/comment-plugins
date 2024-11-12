import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import worker from "../index";
import { env } from "cloudflare:test";
import { getDatabase } from "database";
import { au } from "vitest/dist/chunks/reporters.anwo7Y6a";

describe("Comment Update API", () => {
  let headers;
  let commentId = "";
  let author;
  beforeEach(async () => {
    headers = {
      Authorization: `Bearer ${env.AUTH_TOKEN}`,
      "Content-Type": "application/json",
    };

    author = await getDatabase(env).user.create({
      data: {
        name: "John Doe",
        email: "khoa@itnotbug.dev",
      },
    });

    const comment = await getDatabase(env).comment.create({
      data: {
        content: "This is a test comment",
        authorId: author.id,
        postId: "valid-post-id",
        postType: "post",
      },
    });

    commentId = comment.id;
  });

  it("should update a comment successfully", async () => {
    const requestBody = {
      content: "Updated comment content",
    };
    const res = await worker.request(
      `/api/comments/${commentId}`,
      {
        method: "PUT",
        body: JSON.stringify(requestBody),
        headers,
      },
      env
    );
    const response: {
      success: boolean;
      comment: {
        id: string;
        content: string;
        authorId: string;
        postId: string;
        postType: string;
        parentId: string | null;
      };
    } = await res.json();

    expect(res.status).toBe(200);
    expect(response.success).toBe(true);
    expect(response.comment.content).toEqual(requestBody.content);
  });

  it("should return an error if the comment does not exist", async () => {
    const requestBody = {
      content: "Updated comment content",
    };

    const res = await worker.request(
      `/api/comments/abc`,
      {
        method: "PUT",
        body: JSON.stringify(requestBody),
        headers,
      },
      env
    );
    const response = (await res.json()) as {
      success: boolean;
      error: string;
    };

    expect(res.status).toBe(404);
    expect(response.success).toBe(false);
    expect(response.error).toBe("Comment not found");
  });

  it("should return an error for invalid request body", async () => {
    const requestBody = {
      // Invalid body without content
    };

    const res = await worker.request(
      `/api/comments/${commentId}`,
      {
        method: "PUT",
        body: JSON.stringify(requestBody),
        headers,
      },
      env
    );

    expect(res.status).toBe(400);
  });

  it("should update multiple fields of a comment successfully", async () => {
    const requestBody = {
      content: "Updated comment content",
      postId: "updated-post-id",
      postType: "updated-post-type",
      authorId: author.id,
    };

    const res = await worker.request(
      `/api/comments/${commentId}`,
      {
        method: "PUT",
        body: JSON.stringify(requestBody),
        headers,
      },
      env
    );
    const response = (await res.json()) as {
      success: boolean;
      comment: {
        id: string;
        content: string;
        authorId: string;
        postId: string;
        postType: string;
        parentId: string | null;
      };
    };

    expect(res.status).toBe(200);
    expect(response.success).toBe(true);
    expect(response.comment.content).toEqual(requestBody.content);
    expect(response.comment.postId).toEqual(requestBody.postId);
    expect(response.comment.postType).toEqual(requestBody.postType);
  });

  it("should return an error if the author does not exist", async () => {
    const requestBody = {
      content: "Updated comment content",
      authorId: "non-existent-author-id",
    };

    const res = await worker.request(
      `/api/comments/${commentId}`,
      {
        method: "PUT",
        body: JSON.stringify(requestBody),
        headers,
      },
      env
    );
    const response = (await res.json()) as {
      success: boolean;
      error: string;
    };

    expect(res.status).toBe(400);
    expect(response.success).toBe(false);
    expect(response.error).toBe("Author not found");
  });

  it("should return an error if the parent comment does not exist", async () => {
    const requestBody = {
      content: "Updated comment content",
      parentId: "non-existent-parent-id",
    };

    const res = await worker.request(
      `/api/comments/${commentId}`,
      {
        method: "PUT",
        body: JSON.stringify(requestBody),
        headers,
      },
      env
    );
    const response = (await res.json()) as {
      success: boolean;
      error: string;
    };

    expect(res.status).toBe(400);
    expect(response.success).toBe(false);
    expect(response.error).toBe("Parent comment not found");
  });
});
