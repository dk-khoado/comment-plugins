import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import worker from "../index";
import { env } from "cloudflare:test";

describe("Author List API", () => {
  let headers;

  beforeEach(async () => {
    headers = {
      Authorization: `Bearer ${env.AUTH_TOKEN}`,
      "Content-Type": "application/json",
    };
  });
  it("should return a list of authors with default pagination", async () => {
    const res = await worker.request(
      "/api/authors?page=0&pageSize=10",
      {
        method: "GET",
        headers,
      },
      env
    );
    const response = (await res.json()) as {
      success: boolean;
      result: {
        authors: { id: string; name: string | null; email: string | null }[];
      };
    };

    expect(res.status).toBe(200);
    expect(response.success).toBe(true);
    expect(response.result.authors).toBeInstanceOf(Array);
    expect(response.result.authors.length).toBeLessThanOrEqual(10);
  });

  it("should return a list of authors with custom pagination", async () => {
    const res = await worker.request(
      "/api/authors?page=1&pageSize=5",
      {
        method: "GET",
        headers,
      },
      env
    );
    const response = (await res.json()) as {
      success: boolean;
      result: {
        authors: { id: string; name: string | null; email: string | null }[];
      };
    };

    expect(res.status).toBe(200);
    expect(response.success).toBe(true);
    expect(response.result.authors).toBeInstanceOf(Array);
    expect(response.result.authors.length).toBeLessThanOrEqual(5);
  });

  it("should return an empty list if no authors are found", async () => {
    const res = await worker.request(
      "/api/authors?page=100&pageSize=10",
      {
        method: "GET",
        headers,
      },
      env
    );
    const response = (await res.json()) as {
      success: boolean;
      result: {
        authors: { id: string; name: string | null; email: string | null }[];
      };
    };

    expect(res.status).toBe(200);
    expect(response.success).toBe(true);
    expect(response.result.authors).toBeInstanceOf(Array);
    expect(response.result.authors.length).toBe(0);
  });

  it("should return an error for invalid pagination parameters", async () => {
    const res = await worker.request(
      "/api/authors?page=-1&pageSize=10",
      {
        method: "GET",
        headers,
      },
      env
    );

    expect(res.status).toBe(400);
  });
});
