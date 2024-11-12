import {
  defineWorkersConfig,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers/config";
import path from "path";

export default defineWorkersConfig(() => {
  return import("vite-tsconfig-paths").then(async (mod) => {
    const tsconfigPaths = mod.default;
    // Read all migrations in the `migrations` directory
    const migrationsPath = path.join(__dirname, "migrations");
    const migrations = await readD1Migrations(migrationsPath);
    return {
      root: path.resolve(__dirname),
      plugins: [tsconfigPaths()],
      test: {
        globals: true,
        environment: "node",
        coverage: {
          reporter: ["text", "json", "html"],
        },
        setupFiles: ["./api/test/apply-migrations.ts"],
        poolOptions: {
          workers: {
            wrangler: { configPath: "./wrangler.toml" },
            miniflare: {
              // Add a test-only binding for migrations, so we can apply them in a
              // setup file
              bindings: { TEST_MIGRATIONS: migrations },
            },
          },
        },
      },
    };
  }) as any;
});
