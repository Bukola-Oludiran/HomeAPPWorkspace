/**
 * ui.render meta-bundle — lets the LLM emit a UI fragment without doing any
 * backend work. Used for clarifying questions (QuickActionGroup), guided
 * forms (Form), and quick affirmations.
 *
 * The LLM is constrained to a small, safe subset of fragment types here.
 * Rich data fragments (PropertyCard, MaintenanceRequestCard, etc.) are
 * NEVER author-able by the LLM — only real tools emit those. This keeps
 * the trust boundary: the LLM can't paint a fake "your payment succeeded"
 * card by simply emitting a UI fragment.
 */

import { z } from 'zod';
import type {
    QuickActionGroupProps,
    FormProps,
} from '@homeai/contracts/ui-fragments';
import {
    FormProps as FormPropsSchema,
    QuickActionGroupProps as QuickActionGroupPropsSchema,
} from '@homeai/contracts/ui-fragments';
import type { ToolBundle } from '../types';
import { defineLocalTool } from '../types';

// LLM-authored fragments are restricted to interactive helpers only.
const renderableFragment = z.discriminatedUnion('type', [
    z.object({ type: z.literal('QuickActionGroup'), props: QuickActionGroupPropsSchema }),
    z.object({ type: z.literal('Form'), props: FormPropsSchema }),
]);

const renderParams = z.object({
    fragment: renderableFragment,
});

const render = defineLocalTool({
    name: 'ui.render',
    label: 'Render interactive UI',
    description:
        'Render an interactive UI fragment to the user — use for clarifying questions (QuickActionGroup) or multi-field forms (Form). NOT for displaying data — read tools emit their own fragments.',
    parameters: renderParams,
    async execute({ fragment }, _ctx, sink) {
        sink.ui(fragment);
        const summary =
            fragment.type === 'QuickActionGroup'
                ? `Rendered QuickActionGroup: "${(fragment.props as QuickActionGroupProps).prompt}" with ${(fragment.props as QuickActionGroupProps).actions.length} option(s).`
                : `Rendered Form: "${(fragment.props as FormProps).title}" with ${(fragment.props as FormProps).fields.length} field(s).`;
        return {
            text: summary,
            details: { fragmentType: fragment.type },
            // Stop the turn after rendering so the user can interact.
            terminate: true,
        };
    },
});

export const uiRenderBundle: ToolBundle = {
    name: 'ui',
    description: 'Render interactive UI fragments to the user.',
    eligibleRoles: ['TENANT', 'LANDLORD', 'AGENT', 'ADMIN'],
    readTools: [render],
    writeTools: [],
};
