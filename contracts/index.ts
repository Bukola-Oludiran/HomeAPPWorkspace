/**
 * `@homeai/contracts` — single source of truth for the API contract
 * shared between PropApp (frontend) and PropApp-Backend (backend).
 *
 * Per-domain Zod schemas will live in dedicated files (Stage 2.2):
 *   - auth.contract.ts
 *   - property.contract.ts
 *   - lease.contract.ts
 *   - maintenance.contract.ts
 *   - transactions.contract.ts
 *   - verification.contract.ts
 *   - banking.contract.ts
 *
 * Until those land, prefer importing the specific module:
 *   import type { ApiResponse } from '@homeai/contracts/envelope';
 *   import { PropertyTypeValues } from '@homeai/contracts/enums';
 */

export * from './envelope';
export * from './enums';
