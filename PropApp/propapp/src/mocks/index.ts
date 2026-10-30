/**
 * Fake data shim for frontend work without the backend.
 * Run `npm run dev:mock`; main.tsx loads this module only in that mode.
 */

export { installMockApi } from './adapter';
export { default as MockToolbar } from './MockToolbar';
