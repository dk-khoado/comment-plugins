import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import worker from "../index";
import { env } from "cloudflare:test";
import { getDatabase } from "database";

describe("Comment Delete API", () => {
  let headers;
  let commentId: string;
  let authorId: string;
  beforeEach(async () => {
    headers = {
      Authorization: `Bearer ${env.AUTH_TOKEN}`,
      "Content-Type": "application/json",
    };
    const db = getDatabase(env);

    // Seed author
    const author = {
      name: "Valid Author",
      email: "valid.author@example.com",
    };
    const authorResult = await db.user.create({
      data: author,
    });
    authorId = authorResult.id;

    // Seed comment
    const comment = {
      content: "This is a test comment",
      authorId: authorId,
      postId: "valid-post-id",
      postType: "post",
    };
    const commentResult = await db.comment.create({
      data: comment,
    });
    commentId = commentResult.id;
  });

  it("should delete a comment successfully", async () => {
    const res = await worker.request(
      `/api/comments/${commentId}`,
      {
        method: "DELETE",
        headers,
      },
      env
    );
    const response = (await res.json()) as {
      success: boolean;
    };

    expect(res.status).toBe(200);
    expect(response.success).toBe(true);
  });

  it("should return an error if the comment does not exist", async () => {
    const res = await worker.request(
      `/api/comments/invalid-comment-id`,
      {
        method: "DELETE",
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

  it("should return an error if the user is not authorized", async () => {
    const commentId = "valid-comment-id";

    const res = await worker.request(
      `/api/comments/${commentId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      },
      env
    );

    expect(res.status).toBe(401);
  });
});
