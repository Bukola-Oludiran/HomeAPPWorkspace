/**
 * Maintenance Module - DTO Re-exports
 *
 * Source-of-truth lives in `@homeai/contracts/maintenance.contract`.
 */

export {
    createMaintenanceRequestSchema,
    updateMaintenanceRequestSchema,
    assignAgentSchema,
    maintenanceQuerySchema,
    type CreateMaintenanceRequestDto,
    type UpdateMaintenanceRequestDto,
    type AssignAgentDto,
    type MaintenanceQueryDto,
} from '@homeai/contracts/maintenance.contract';
