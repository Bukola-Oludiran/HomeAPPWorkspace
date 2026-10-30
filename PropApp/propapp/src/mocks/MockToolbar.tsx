import React from 'react';
import { tokenManager } from '@/lib/api/client';
import { USERS, type MockRole } from './data';
import { ROLE_KEY, currentRole } from './handlers';

const HOME: Record<MockRole, string> = {
    TENANT: '/tenant/dashboard',
    LANDLORD: '/landlord/dashboard',
    AGENT: '/agent/jobs',
};

const LABEL: Record<MockRole, string> = { TENANT: 'Tenant', LANDLORD: 'Landlord', AGENT: 'Agent' };

function signInAs(role: MockRole) {
    tokenManager.setTokens(`mock-access-${role.toLowerCase()}`, `mock-refresh-${role.toLowerCase()}`);
    tokenManager.setStoredUser(USERS[role]);
    try { localStorage.setItem(ROLE_KEY, role); } catch { /* ignore */ }
    // Full reload so AuthContext restores the session from storage
    window.location.assign(HOME[role]);
}

function signOut() {
    tokenManager.clearTokens();
    window.location.assign('/');
}

/**
 * MockToolbar - Dev-only persona switcher shown in `npm run dev:mock`
 */
const MockToolbar: React.FC = () => {
    const signedIn = Boolean(tokenManager.getAccessToken());
    const role = currentRole();

    return (
        <div
            role="region"
            aria-label="Mock data controls"
            className="fixed bottom-4 left-4 z-[60] flex items-center gap-1 rounded-full border border-border-strong bg-card/95 p-1 pl-3 text-[13px] text-foreground backdrop-blur"
        >
            <span className="mr-1 flex items-center gap-1 font-semibold text-muted-foreground">
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">science</span>
                Mock data
            </span>
            {(Object.keys(LABEL) as MockRole[]).map((r) => {
                const active = signedIn && r === role;
                return (
                    <button
                        key={r}
                        type="button"
                        aria-pressed={active}
                        onClick={() => signInAs(r)}
                        className={`h-8 rounded-full px-3 font-semibold transition-colors ${active ? 'bg-brand-ink text-on-brand' : 'hover:bg-accent'}`}
                    >
                        {LABEL[r]}
                    </button>
                );
            })}
            {signedIn && (
                <button type="button" onClick={signOut} className="h-8 rounded-full px-3 font-semibold text-muted-foreground hover:bg-accent">
                    Sign out
                </button>
            )}
        </div>
    );
};

export default MockToolbar;
