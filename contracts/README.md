# `@homeai/contracts`

Single source of truth for HomeAI API contracts shared between
`PropApp-Backend/core-backend` (Express + Prisma + Zod) and
`PropApp/propapp` (React + Vite + Axios).

## Scope

- **Envelope shapes**: `ApiResponse<T>`, `ApiError`, `PaginationMeta`.
- **Enums**: every cross-cutting enum value (PropertyType, PropertyStatus,
  MaintenanceStatus, etc.) lives here as a const-asserted union plus the
  derived TypeScript union type.
- **Per-domain contracts** (added in Stage 2.2): Zod schemas + inferred
  types per domain (auth, property, lease, maintenance, transactions,
  verification, banking).

## How it's wired

Both `PropApp/propapp/tsconfig.app.json` and `PropApp-Backend/core-backend/tsconfig.json`
declare a path alias `@homeai/contracts/*` resolving to this directory.
`PropApp/propapp/vite.config.ts` mirrors the alias for the bundler.

Backend usage:
```ts
import { PropertyTypeValues } from '@homeai/contracts/enums';
import { createPropertySchema } from '@homeai/contracts/property.contract';
```

Frontend usage (same import path):
```ts
import type { ApiResponse, PaginationMeta } from '@homeai/contracts/envelope';
import type { CreatePropertyRequest } from '@homeai/contracts/property.contract';
```

## Drift policy

If you need to change an API field, change it here first. The frontend
and backend should both fail to compile until they consume the new
shape. That's the success criterion of this directory — drift becomes
a compile error rather than a silent runtime mismatch.

## OpenAPI / Swagger

Each domain contract also calls `registerXxxPaths(registry)` to emit
its endpoints into a shared `@asteasolutions/zod-to-openapi` registry.
The backend aggregates the registry in `src/config/swagger.ts` and
serves both the live Swagger UI (`/api-docs`) and a generator script:

```sh
cd PropApp-Backend/core-backend
npm run generate:openapi       # writes openapi.json
```

Change a Zod schema, run `generate:openapi`, and the spec moves with
it — no per-endpoint `@swagger` JSDoc to keep in sync.

### Downstream codegen

`openapi.json` is the canonical artifact for any downstream consumer:

- **TypeScript types for a separate frontend or mobile app** —
  [`openapi-typescript`](https://github.com/openapi-ts/openapi-typescript)
  generates `.d.ts` files. The PropApp frontend in this repo imports
  contracts directly so it does not need this step; an external client
  would consume `openapi.json` instead.
- **React Query hooks / Axios clients** — [`orval`](https://orval.dev)
  or [`@hey-api/openapi-ts`](https://github.com/hey-api/openapi-ts)
  generate typed client SDKs from the spec.
- **Postman collection / curl examples** — Postman's OpenAPI import
  accepts the generated file unchanged.

The `generate:openapi` script can be added to CI to publish
`openapi.json` to a known URL (S3 bucket, GitHub Pages, internal
docs site) so downstream consumers pick up new endpoints
automatically.
