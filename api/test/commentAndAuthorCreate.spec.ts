import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import worker from "../index";
import { env } from "cloudflare:test";
import { getDatabase } from "database";

describe("Comment and Author Create API", () => {
  let headers;

  beforeEach(async () => {
    headers = {
      Authorization: `Bearer ${env.AUTH_TOKEN}`,
      "Content-Type": "application/json",
    };
  });

  it("should create a new comment and author successfully", async () => {
    const requestBody = {
      author: {
        name: "New Author",
        email: "new.author@example.com",
      },
      comment: {
        content: "This is a test comment",
        postId: "valid-post-id",
        postType: "post",
      },
    };

    const res = await worker.request(
      "/api/comments-and-authors",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers,
      },
      env
    );
    const response = (await res.json()) as {
      success: boolean;
      author: {
        id: string;
        name: string | null;
        email: string | null;
      };
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
    expect(response.author.name).toEqual(requestBody.author.name);
    expect(response.author.email).toEqual(requestBody.author.email);
    expect(response.comment.content).toEqual(requestBody.comment.content);
    expect(response.comment.postId).toEqual(requestBody.comment.postId);
    expect(response.comment.postType).toEqual(requestBody.comment.postType);
  });

  it("should return an error if the parent comment does not exist", async () => {
    const requestBody = {
      author: {
        name: "New Author",
        email: "new.author@example.com",
      },
      comment: {
        content: "This is a test comment",
        parentId: "non-existent-parent-id",
        postId: "valid-post-id",
        postType: "post",
      },
    };

    const res = await worker.request(
      "/api/comments-and-authors",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers,
      },
      env
    );
    const response = (await res.json()) as {
      success: boolean;
      message: string;
    };

    expect(res.status).toBe(200);
    expect(response.success).toBe(false);
    expect(response.message).toBe("Parent comment does not exist");
  });

  it("should create a comment with an existing author", async () => {
    // Seed an existing author
    await worker.request(
      "/api/authors",
      {
        method: "POST",
        body: JSON.stringify({
          name: "Existing Author",
          email: "existing.author@example.com",
        }),
        headers,
      },
      env
    );

    const requestBody = {
      author: {
        email: "existing.author@example.com",
      },
      comment: {
        content: "This is a test comment",
        postId: "valid-post-id",
        postType: "post",
      },
    };

    const res = await worker.request(
      "/api/comments-and-authors",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers,
      },
      env
    );
    const response = (await res.json()) as {
      success: boolean;
      author: {
        id: string;
        name: string | null;
        email: string | null;
      };
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
    expect(response.author.email).toEqual(requestBody.author.email);
    expect(response.comment.content).toEqual(requestBody.comment.content);
    expect(response.comment.postId).toEqual(requestBody.comment.postId);
    expect(response.comment.postType).toEqual(requestBody.comment.postType);
  });

  it("should return an error for invalid request body", async () => {
    const requestBody = {
      author: {
        email: "invalid-email",
      },
      comment: {
        content: "This is a test comment",
        postId: "valid-post-id",
        postType: "post",
      },
    };

    const res = await worker.request(
      "/api/comments-and-authors",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers,
      },
      env
    );

    expect(res.status).toBe(400);
  });

  it("should return an error if content is missing", async () => {
    const requestBody = {
      author: {
        name: "New Author",
        email: "new.author@example.com",
      },
      comment: {
        postId: "valid-post-id",
        postType: "post",
      },
    };

    const res = await worker.request(
      "/api/comments-and-authors",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers,
      },
      env
    );

    expect(res.status).toBe(400);
  });

  it("should return an error if postId is missing", async () => {
    const requestBody = {
      author: {
        name: "New Author",
        email: "new.author@example.com",
      },
      comment: {
        content: "This is a test comment",
        postType: "post",
      },
    };

    const res = await worker.request(
      "/api/comments-and-authors",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers,
      },
      env
    );

    expect(res.status).toBe(400);
  });

  it("should return an error if the reply is beyond 2 levels deep", async () => {
    const db = getDatabase(env);
    const authorId = "existing-author-id"; // Replace with actual author ID
    const parentId = "existing-parent-id"; // Replace with actual parent ID

    // Seed a second-level comment
    const secondLevelComment = {
      content: "This is a second-level comment",
      authorId: authorId,
      postId: "1",
      postType: "post",
      parentId: parentId,
    };
    const secondLevelCommentResult = await db.comment.create({
      data: secondLevelComment,
    });

    const requestBody = {
      author: {
        name: "John Doe",
        email: "john.doe@example.com",
      },
      comment: {
        content: "This is a third-level comment",
        parentId: secondLevelCommentResult.id,
        postId: "1",
        postType: "post",
      },
    };

    const res = await worker.request(
      "/api/comments-and-authors",
      {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      },
      env
    );
    expect(res.status).toBe(400);
    const response: any = await res.json();
    expect(response.message).toBe(
      "Replies beyond 2 levels deep are not allowed"
    );
  });
});
