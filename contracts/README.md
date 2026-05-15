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
