/**
 * Agent Module - DTO Re-exports
 *
 * Source-of-truth lives in `@homeai/contracts/agent.contract`.
 */

export {
    jobQuerySchema,
    acceptJobSchema,
    declineJobSchema,
    completeJobSchema,
    addScheduleEventSchema,
    scheduleQuerySchema,
    withdrawSchema,
    type JobQueryDto,
    type AcceptJobDto,
    type DeclineJobDto,
    type CompleteJobDto,
    type AddScheduleEventDto,
    type ScheduleQueryDto,
    type WithdrawDto,
} from '@homeai/contracts/agent.contract';
