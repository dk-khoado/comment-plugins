# Cloudflare Workers OpenAPI 3.1

This project is a Cloudflare Worker with OpenAPI 3.1 using [chanfana](https://github.com/cloudflare/chanfana) and [Hono](https://github.com/honojs/hono). It serves as a quick start for building OpenAPI compliant Workers that automatically generate the `openapi.json` schema from code and validate incoming requests against defined parameters or request bodies.

## Features

- **OpenAPI 3.1**: Automatically generate OpenAPI schema from code.
- **Request Validation**: Validate incoming requests against defined schemas.
- **Cloudflare Workers**: Deploy serverless functions on Cloudflare's global network.

## Project Structure

- `src/index.ts`: Main router definition.
- `src/endpoints/`: Directory containing individual endpoint files.
- `prisma/schema.prisma`: Prisma schema definition for the database.
- `migrations/`: Directory containing database migration files.

## Getting Started

1. **Sign Up**: Sign up for [Cloudflare Workers](https://workers.dev). The free tier is sufficient for most use cases.
2. **Clone Project**: Clone this project and install dependencies with `npm install`.
3. **Login**: Run `wrangler login` to log in to your Cloudflare account using Wrangler.
4. **Deploy**: Run `wrangler deploy` to publish the API to Cloudflare Workers.

## Development

1. **Start Local Instance**: Run `wrangler dev` to start a local instance of the API.
2. **Swagger Interface**: Open `http://localhost:8787/` in your browser to see the Swagger interface where you can try the endpoints.
3. **Auto Reload**: Changes made in the `src/` folder will automatically trigger the server to reload. Refresh the Swagger interface to see the updates.

## Scripts

- **Deploy**: `npm run deploy` - Deploy the API to Cloudflare Workers.
- **Dev**: `npm run dev` - Start a local development server.
- **Start**: `npm run start` - Alias for `npm run dev`.
- **Generate Types**: `npm run cf-typegen` - Generate Cloudflare Worker types.
- **Create Migration**: `npm run create-migration` - Create a new database migration.

## Dependencies

- **@prisma/adapter-d1**: Prisma adapter for Cloudflare D1.
- **@prisma/client**: Prisma client for database access.
- **chanfana**: Library for OpenAPI integration with Cloudflare Workers.
- **hono**: Small, simple, and ultrafast web framework for Cloudflare Workers.
- **zod**: TypeScript-first schema declaration and validation library.

## Dev Dependencies

- **@cloudflare/workers-types**: Type definitions for Cloudflare Workers.
- **@types/node**: Type definitions for Node.js.
- **@types/service-worker-mock**: Type definitions for service worker mock.
- **prisma**: Prisma ORM.
- **wrangler**: CLI tool for managing Cloudflare Workers.

## License

This project is licensed under the MIT License.