import { buildOpenApiDocument } from '../../src/config/swagger';
import { CANONICAL_OPENAPI_PATHS } from '@homeai/contracts/routes';

describe('frontend/backend route contract', () => {
    it.each(CANONICAL_OPENAPI_PATHS)('registers %s in OpenAPI', path => {
        expect(buildOpenApiDocument().paths?.[path]).toBeDefined();
    });
});
