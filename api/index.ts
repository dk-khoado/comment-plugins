import { fromHono } from "chanfana";
import { Hono } from "hono";
import { CommentCreate } from "./endpoints/commentCreate";
import { CommentList } from "./endpoints/commentList";
import { AuthorCreate } from "./endpoints/authorCreate";
import { AuthorList } from "./endpoints/authorList";
import { CommentsByPostId } from "./endpoints/commentByPostId";
import { CommentUpdate } from "./endpoints/commentUpdate";
import { CommentDelete } from "./endpoints/commentDelete";
import { CommentAndAuthorCreate } from "./endpoints/commentAndAuthorCreate";
import { authentication } from "./middleware/authentication"; // Import the authentication middleware

// This ensures c.env.DB is correctly typed
type Bindings = {
  DB: D1Database;
  AUTH_TOKEN: string;
};

// Start a Hono app
const app = new Hono<{ Bindings: Bindings }>();

// Use the authentication middleware
app.use("/api/*", authentication);

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/docs",
});

// Register OpenAPI endpoints
openapi.post("/api/authors", AuthorCreate);
openapi.get("/api/authors", AuthorList);
openapi.get("/api/comments", CommentList);
openapi.post("/api/comments", CommentCreate);
openapi.put("/api/comments/:commentId", CommentUpdate);
openapi.delete("/api/comments/:commentId", CommentDelete);
openapi.post("/api/comments-and-authors", CommentAndAuthorCreate);
openapi.get("/api/comments/posts/:postId", CommentsByPostId);

// Export the Hono app
export default app;
