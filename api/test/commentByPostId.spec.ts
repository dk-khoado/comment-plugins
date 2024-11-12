import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import worker from "../index";
import { env } from "cloudflare:test";

describe("Comments By Post ID API", () => {
  let headers;

  beforeEach(async () => {
    headers = {
      Authorization: `Bearer ${env.AUTH_TOKEN}`,
      "Content-Type": "application/json",
    };
  });
  it("should return a list of comments for a valid postId", async () => {
    const postId = "valid-post-id";

    const res = await worker.request(
      `/api/comments/posts/${postId}`,
      {
        method: "GET",
      },
      env
    );
    const response = (await res.json()) as {
      success: boolean;
      result: {
        comments: {
          id: string;
          content: string;
          postId: string;
          author: { id: string; name: string | null };
          createdAt: string;
        }[];
      };
    };

    expect(res.status).toBe(200);
    expect(response.success).toBe(true);
    expect(response.result.comments).toBeInstanceOf(Array);
  });

  it("should return an empty list if no comments are found for the postId", async () => {
    const postId = "non-existent-post-id";

    const res = await worker.request(
      `/api/comments/posts/Id}`,
      {
        method: "GET",
      },
      env
    );
    const response = (await res.json()) as {
      success: boolean;
      result: {
        comments: {
          id: string;
          content: string;
          postId: string;
          author: { id: string; name: string | null };
          createdAt: string;
        }[];
      };
    };

    expect(res.status).toBe(200);
    expect(response.success).toBe(true);
    expect(response.result.comments).toBeInstanceOf(Array);
    expect(response.result.comments.length).toBe(0);
  });

  it("should return an error for an invalid postId", async () => {
    const postId = "";

    const res = await worker.request(
      `/api/comments/posts/${postId}`,
      {
        method: "GET",
        headers,
      },
      env
    );

    expect(res.status).toBe(404);
  });

  it("should return comments in descending order of creation date", async () => {
    const postId = "valid-post-id";

    const res = await worker.request(
      `/api/comments/posts/Id}`,
      {
        method: "GET",
      },
      env
    );
    const response = (await res.json()) as {
      success: boolean;
      result: {
        comments: {
          id: string;
          content: string;
          postId: string;
          author: { id: string; name: string | null };
          createdAt: string;
        }[];
      };
    };

    expect(res.status).toBe(200);
    expect(response.success).toBe(true);
    expect(response.result.comments).toBeInstanceOf(Array);

    const comments = response.result.comments;
    for (let i = 1; i < comments.length; i++) {
      expect(
        new Date(comments[i - 1].createdAt).getTime()
      ).toBeGreaterThanOrEqual(new Date(comments[i].createdAt).getTime());
    }
  });
});
