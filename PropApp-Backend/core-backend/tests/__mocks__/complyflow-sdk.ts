// Test-only stub for @complyflow/sdk. Avoids loading the real ESM build inside
// Jest's CommonJS sandbox. Surface matches just enough of the real SDK that
// safeEmit + comply.bootstrap import without exploding.

export const comply = {
    init: (): void => undefined,
    dataAccess: (): void => undefined,
    accessControl: (): void => undefined,
    dataFlow: (): void => undefined,
    shutdown: async (): Promise<void> => undefined,
};
