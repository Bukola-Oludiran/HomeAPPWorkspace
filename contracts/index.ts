/**
 * `@homeai/contracts` — single source of truth for the API contract
 * shared between PropApp (frontend) and PropApp-Backend (backend).
 *
 * Migration progress (Stage 2.2):
 *   [x] auth.contract.ts          — request schemas + inferred types
 *   [x] property.contract.ts      — request schemas + inferred types
 *   [x] lease.contract.ts         — request schemas + inferred types
 *   [x] maintenance.contract.ts   — request schemas + inferred types
 *   [x] transactions.contract.ts  — request schemas + inferred types
 *   [x] verification.contract.ts  — request schemas + inferred types
 *   [x] banking.contract.ts       — request schemas + inferred types
 *
 * Prefer importing the specific module for IDE auto-import clarity:
 *   import type { ApiResponse } from '@homeai/contracts/envelope';
 *   import { PropertyTypeValues } from '@homeai/contracts/enums';
 *   import { loginSchema, type LoginRequest } from '@homeai/contracts/auth.contract';
 */

export * from './envelope';
export * from './enums';
