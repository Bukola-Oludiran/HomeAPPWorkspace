/**
 * Social Account Linking DTO
 * Per APIRevised.md Section 6
 */

import { z } from 'zod';

export const linkAccountSchema = z.object({
    idToken: z.string().min(10),
});

export type LinkAccountDto = z.infer<typeof linkAccountSchema>;
