import { fromHono } from "chanfana";
import { Hono } from "hono";
import { CommentCreate } from "./endpoints/taskCreate";
import { TaskDelete } from "./endpoints/taskDelete";
import { TaskFetch } from "./endpoints/taskFetch";
import { CommentList } from "./endpoints/commentList";

// This ensures c.env.DB is correctly typed
type Bindings = {
  DB: D1Database;
};

// Start a Hono app
const app = new Hono<{ Bindings: Bindings }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/",
});

// Register OpenAPI endpoints
openapi.get("/api/comment", CommentList);
openapi.post("/api/comment", CommentCreate);
// openapi.get("/api/tasks/:taskSlug", TaskFetch);
// openapi.delete("/api/tasks/:taskSlug", TaskDelete);

// Export the Hono app
export default app;
