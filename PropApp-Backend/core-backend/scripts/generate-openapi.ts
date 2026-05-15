/**
 * Generate `openapi.json` from the in-process OpenAPI registry.
 *
 * Run via `npm run generate:openapi`. The output file is consumed by
 * CI (publish step), Postman, and any downstream codegen tool such as
 * `openapi-typescript` or `orval`.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { buildOpenApiDocument } from '../src/config/swagger';

const OUTPUT_PATH = resolve(__dirname, '../openapi.json');

const document = buildOpenApiDocument();

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, JSON.stringify(document, null, 2) + '\n', 'utf8');

const pathCount = Object.keys(document.paths ?? {}).length;
const schemaCount = Object.keys(document.components?.schemas ?? {}).length;

// eslint-disable-next-line no-console
console.log(
    `[generate-openapi] wrote ${OUTPUT_PATH} (${pathCount} paths, ${schemaCount} schemas)`
);
