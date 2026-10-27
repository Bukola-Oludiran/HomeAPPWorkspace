export type DataClassification = 'public' | 'internal' | 'confidential' | 'PII' | 'PCI' | 'financial' | 'health';

export interface ComplianceActor {
    userId?: string;
    role?: string;
    service?: string;
}

export interface DataAccessInput {
    resource: string;
    action: string;
    dataClassification: DataClassification;
    actor: ComplianceActor;
    reason?: string;
    recordCount?: number;
    batchReason?: string;
}

export interface AccessControlInput {
    resource: string;
    actor: ComplianceActor;
    granted: boolean;
    method: string;
    dataClassification: DataClassification;
}

export interface DataFlowInput {
    from: string;
    to: string;
    dataClassification: DataClassification;
    encrypted: boolean;
    transformed?: boolean;
}

export interface ComplianceAdapter {
    init(config: ComplianceAdapterConfig): void;
    dataAccess(input: DataAccessInput): void;
    accessControl(input: AccessControlInput): void;
    dataFlow(input: DataFlowInput): void;
    shutdown(): Promise<void>;
}

export interface ComplianceAdapterConfig {
    apiKey: string;
    tenantId: string;
    endpoint: string;
    serviceName: string;
}
