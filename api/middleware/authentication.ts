import { Context, Next } from "hono";

export const authentication = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");
  const path = c.req.path;
  const method = c.req.method;

  // Define the paths and methods to ignore
  const ignoredPaths = [
    { path: "/api/comments", method: "POST" },
    { path: "/api/authors", method: "POST" },
    { path: "/api/comments-and-authors", method: "POST" },
    { path: /^\/api\/comments\/[^/]+$/, method: "GET" }, // Regex to match /api/comments/:postId
  ];

  // Check if the current request should be ignored
  if (shouldIgnorePath(path, method, ignoredPaths)) {
    await next();
    return;
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }

  const token = authHeader.substring(7);

  // Validate the token
  if (!validateToken(token, c.env.AUTH_TOKEN)) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }

  // Proceed to the next middleware or route handler
  await next();
};

// Function to check if the path and method should be ignored
const shouldIgnorePath = (
  path: string,
  method: string,
  ignoredPaths: { path: string | RegExp; method: string }[]
): boolean => {
  return ignoredPaths.some((ignored) => {
    if (ignored.path instanceof RegExp) {
      return ignored.path.test(path) && ignored.method === method;
    }
    return ignored.path === path && ignored.method === method;
  });
};

// Function for token validation
const validateToken = (token: string, validToken: string): boolean => {
  return token === validToken;
};
