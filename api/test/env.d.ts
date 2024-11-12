declare module "cloudflare:test" {
  // Controls the type of `import("cloudflare:test").env`
  interface ProvidedEnv extends Env {
    AUTH_TOKEN: any;
    TEST_MIGRATIONS: D1Migration[]; // Defined in `vitest.config.mts`
    DB: D1Database;
  }
}