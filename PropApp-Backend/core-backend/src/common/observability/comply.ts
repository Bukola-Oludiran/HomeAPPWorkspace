import { comply } from '@complyflow/sdk';
import type {
    DataAccessInput,
    AccessControlInput,
    DataFlowInput,
} from '@complyflow/shared';
import { isComplyEnabled } from './comply.bootstrap';
import { logger } from '../utils/logger';

/**
 * The single point of contact between HomeAPP code and the ComplyFlow SDK.
 *
 * NOTE on async context: the SDK does not propagate actor data across async
 * boundaries. Every call must pass `actor` explicitly. If you are emitting
 * inside a setTimeout/queueMicrotask/Promise.then, capture the actor in the
 * closure first.
 */
export const safeEmit = {
    dataAccess(input: DataAccessInput): void {
        if (!isComplyEnabled()) return;
        try {
            comply.dataAccess(input);
        } catch (err) {
            logger.debug('safeEmit.dataAccess swallowed error', { error: err });
        }
    },

    accessControl(input: AccessControlInput): void {
        if (!isComplyEnabled()) return;
        try {
            comply.accessControl(input);
        } catch (err) {
            logger.debug('safeEmit.accessControl swallowed error', { error: err });
        }
    },

    dataFlow(input: DataFlowInput): void {
        if (!isComplyEnabled()) return;
        try {
            comply.dataFlow(input);
        } catch (err) {
            logger.debug('safeEmit.dataFlow swallowed error', { error: err });
        }
    },
};
