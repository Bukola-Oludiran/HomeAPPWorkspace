/**
 * P1 smoke test for the maintenance gRPC surface.
 *
 * Run after `npm run dev` (or via the wrapping script that boots the server
 * in the background). Confirms three things:
 *   1. The gRPC server is listening on GRPC_PORT.
 *   2. Calls without an Authorization metadata are rejected with
 *      UNAUTHENTICATED.
 *   3. Calls with a malformed bearer token are rejected with
 *      UNAUTHENTICATED, not crashed.
 *
 * The happy path (real JWT → real DB write) is a manual exercise once the
 * AI service exists, since this script intentionally has no access to the
 * users table for ID-mintage.
 */

import path from 'path';
import {
    credentials,
    loadPackageDefinition,
    Metadata,
    status as GrpcStatus,
} from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const PROTO_PATH = path.resolve(__dirname, '../../../proto/maintenance.proto');
const GRPC_HOST = process.env.GRPC_HOST ?? 'localhost';
const GRPC_PORT = Number(process.env.GRPC_PORT ?? 50051);

const definition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const pkg = loadPackageDefinition(definition) as any;
const Service = pkg.homeai.maintenance.v1.MaintenanceService;
const client = new Service(`${GRPC_HOST}:${GRPC_PORT}`, credentials.createInsecure());

function callAsync(
    method: string,
    request: Record<string, unknown>,
    metadata: Metadata = new Metadata()
): Promise<{ err: any; response: any }> {
    return new Promise((resolve) => {
        client[method](request, metadata, (err: any, response: any) => {
            resolve({ err, response });
        });
    });
}

async function main(): Promise<void> {
    let failures = 0;

    // 1. No auth → UNAUTHENTICATED
    {
        const { err, response } = await callAsync('SubmitMaintenanceRequest', {
            property_id: '00000000-0000-0000-0000-000000000000',
            category: 'plumbing',
            description: 'smoke test, should never run',
            priority: 'MEDIUM',
            preferred_time_slot: 'ANY',
        });
        if (response) {
            console.error('✗ No-auth call returned a response; expected error');
            failures += 1;
        } else if (err?.code !== GrpcStatus.UNAUTHENTICATED) {
            console.error(`✗ No-auth call returned code=${err?.code}, expected UNAUTHENTICATED`);
            failures += 1;
        } else {
            console.log('✓ No-auth call → UNAUTHENTICATED');
        }
    }

    // 2. Garbage bearer → UNAUTHENTICATED
    {
        const meta = new Metadata();
        meta.set('authorization', 'Bearer not-a-real-token');
        const { err, response } = await callAsync(
            'SubmitMaintenanceRequest',
            {
                property_id: '00000000-0000-0000-0000-000000000000',
                category: 'plumbing',
                description: 'smoke test, should never run',
                priority: 'MEDIUM',
                preferred_time_slot: 'ANY',
            },
            meta
        );
        if (response) {
            console.error('✗ Bad-token call returned a response; expected error');
            failures += 1;
        } else if (err?.code !== GrpcStatus.UNAUTHENTICATED) {
            console.error(`✗ Bad-token call returned code=${err?.code}, expected UNAUTHENTICATED`);
            failures += 1;
        } else {
            console.log('✓ Bad-token call → UNAUTHENTICATED');
        }
    }

    // 3. Malformed metadata (no Bearer prefix) → UNAUTHENTICATED
    {
        const meta = new Metadata();
        meta.set('authorization', 'not-a-bearer-header');
        const { err, response } = await callAsync(
            'SubmitMaintenanceRequest',
            {
                property_id: '00000000-0000-0000-0000-000000000000',
                category: 'plumbing',
                description: 'smoke test, should never run',
                priority: 'MEDIUM',
                preferred_time_slot: 'ANY',
            },
            meta
        );
        if (response) {
            console.error('✗ Malformed-meta call returned a response; expected error');
            failures += 1;
        } else if (err?.code !== GrpcStatus.UNAUTHENTICATED) {
            console.error(`✗ Malformed-meta call returned code=${err?.code}, expected UNAUTHENTICATED`);
            failures += 1;
        } else {
            console.log('✓ Malformed-meta call → UNAUTHENTICATED');
        }
    }

    client.close();
    if (failures > 0) {
        console.error(`\nFAIL: ${failures} smoke check(s) did not pass`);
        process.exit(1);
    }
    console.log('\nPASS: gRPC server is up and the auth interceptor rejects bad inputs');
    process.exit(0);
}

main().catch((e) => {
    console.error('Smoke test crashed:', e);
    process.exit(2);
});
