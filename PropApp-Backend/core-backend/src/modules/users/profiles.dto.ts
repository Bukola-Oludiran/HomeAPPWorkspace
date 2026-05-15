/**
 * Role-Specific Profiles - DTO Re-exports
 *
 * Source-of-truth lives in `@homeai/contracts/users.contract`.
 */

export {
    tenantProfileSchema,
    landlordProfileSchema,
    agentProfileSchema,
    addCertificationSchema,
    type TenantProfileDto,
    type LandlordProfileDto,
    type AgentProfileDto,
    type AddCertificationDto,
} from '@homeai/contracts/users.contract';
