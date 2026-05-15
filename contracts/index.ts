/**
 * `@homeai/contracts` — single source of truth for the API contract
 * shared between PropApp (frontend) and PropApp-Backend (backend).
 *
 * Migration progress (Stage 2.2):
 *   [x] auth.contract.ts          — request schemas + inferred types
 *   [ ] property.contract.ts
 *   [ ] lease.contract.ts
 *   [ ] maintenance.contract.ts
 *   [ ] transactions.contract.ts
 *   [ ] verification.contract.ts
 *   [ ] banking.contract.ts
 *
 * Prefer importing the specific module for IDE auto-import clarity:
 *   import type { ApiResponse } from '@homeai/contracts/envelope';
 *   import { PropertyTypeValues } from '@homeai/contracts/enums';
 *   import { loginSchema, type LoginRequest } from '@homeai/contracts/auth.contract';
 */

export * from './envelope';
export * from './enums';
