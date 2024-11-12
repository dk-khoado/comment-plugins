import { describe, it, expect, beforeEach } from "vitest";
import worker from "../index";
import { env } from "cloudflare:test";
import { get } from "http";
import { getDatabase } from "database";

describe("Comment Create API", () => {
  let headers;
  let author;
  let post;
  beforeEach(async () => {
    const db = env.DB;
    headers = {
      Authorization: `Bearer ${env.AUTH_TOKEN}`,
      "Content-Type": "application/json",
    };

    author = await getDatabase(env).user.create({
      data: {
        name: "John Doe",
        email: "john.doe@example.com",
      },
    });

    post = await getDatabase(env).comment.create({
      data: {
        content: "This is a test post",
        authorId: author.id,
        postType: "post",
      },
    });
  });
  it("should create a new comment successfully", async () => {
    const requestBody = {
      content: "This is a test comment",
      authorId: author.id,
      postId: "valid-post-id",
      postType: "post",
    };

    const res = await worker.request(
      "/api/comments",
      {
        method: "POST",
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
    expect(response.comment.authorId).toEqual(requestBody.authorId);
    expect(response.comment.postId).toEqual(requestBody.postId);
    expect(response.comment.postType).toEqual(requestBody.postType);
  });

  it("should return an error if the author does not exist", async () => {
    const requestBody = {
      content: "This is a test comment",
      authorId: "non-existent-author-id",
      postId: "valid-post-id",
      postType: "post",
    };

    const res = await worker.request(
      "/api/comments",
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
    expect(response.message).toBe("Author does not exist");
  });

  it("should return an error if the parent comment does not exist", async () => {
    const requestBody = {
      content: "This is a test comment",
      authorId: author.id,
      postId: "valid-post-id",
      postType: "post",
      parentId: "non-existent-parent-id",
    };

    const res = await worker.request(
      "/api/comments",
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
    expect(response.message).toBe("Parent comment does not exist");
  });

  it("should create a comment with a parent comment successfully", async () => {
    const requestBody = {
      content: "This is a reply to a comment",
      authorId: author.id,
      postId: "valid-post-id",
      postType: "post",
      parentId: post.id,
    };

    const res = await worker.request(
      "/api/comments",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
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
    expect(response.comment.authorId).toEqual(requestBody.authorId);
    expect(response.comment.postId).toEqual(requestBody.postId);
    expect(response.comment.postType).toEqual(requestBody.postType);
    expect(response.comment.parentId).toEqual(requestBody.parentId);
  });

  it("should return an error for invalid request body", async () => {
    const requestBody = {
      content: "This is a test comment",
      authorId: "valid-author-id",
      // Missing postId and postType
    };

    const res = await worker.request(
      "/api/comments",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
      env
    );

    expect(res.status).toBe(400);
  });
});
