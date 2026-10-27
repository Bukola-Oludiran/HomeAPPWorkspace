import type {
    AccessControlInput,
    ComplianceAdapter,
    ComplianceAdapterConfig,
    DataAccessInput,
    DataFlowInput,
} from './compliance.types';

class HttpComplianceAdapter implements ComplianceAdapter {
    private config: ComplianceAdapterConfig | null = null;
    private pending = new Set<Promise<void>>();

    init(config: ComplianceAdapterConfig): void {
        this.config = config;
    }

    dataAccess(input: DataAccessInput): void {
        this.enqueue('data-access', input);
    }

    accessControl(input: AccessControlInput): void {
        this.enqueue('access-control', input);
    }

    dataFlow(input: DataFlowInput): void {
        this.enqueue('data-flow', input);
    }

    async shutdown(): Promise<void> {
        await Promise.allSettled(this.pending);
    }

    private enqueue(path: string, input: unknown): void {
        if (!this.config) return;
        const config = this.config;
        const request = fetch(`${config.endpoint.replace(/\/$/, '')}/${path}`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${config.apiKey}`,
                'x-tenant-id': config.tenantId,
            },
            body: JSON.stringify({ serviceName: config.serviceName, ...input as object }),
        }).then(() => undefined).catch(() => undefined);
        this.pending.add(request);
        request.finally(() => this.pending.delete(request));
    }
}

export const complianceAdapter: ComplianceAdapter = new HttpComplianceAdapter();
