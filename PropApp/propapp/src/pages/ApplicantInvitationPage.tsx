import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { integrationService } from '../lib/api/services/integrationService';
import Logo from '@/components/common/Logo';
import ContourMotif, { type ContourFragment } from '@/components/common/ContourMotif';
import { formatDateTime } from '@/lib/format';

// The card is centred on the page; a wide band passes behind it, with fragments off two corners
const INVITATION_CONTOUR_FRAGMENTS: ContourFragment[] = [
    '-top-24 -right-40 w-[70vw] max-w-[640px]',
    '-bottom-24 -left-40 w-[70vw] max-w-[640px] rotate-180',
    'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-[1100px]',
];

interface Invitation {
    email: string;
    expiresAt: string;
    acceptedAt?: string | null;
    property: { name: string };
    landlord: { firstName?: string | null; lastName?: string | null };
}

export default function ApplicantInvitationPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [invitation, setInvitation] = useState<Invitation | null>(null);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;
        integrationService.getInvitation(token)
            .then(response => setInvitation(response.data as Invitation))
            .catch(() => setError('This invitation is invalid, expired, or has been revoked.'))
            .finally(() => setLoading(false));
    }, [token]);

    const accept = async () => {
        if (!token) return;
        setAccepting(true);
        setError(null);
        try {
            const response = await integrationService.acceptInvitation(token);
            const application = response.data as { id: string };
            navigate(`/tenant/applications/${application.id}`);
        } catch {
            setError('The invitation could not be accepted. Confirm that you signed in with the invited tenant email.');
        } finally {
            setAccepting(false);
        }
    };

    return (
        <main className="relative flex min-h-screen items-center overflow-hidden bg-canvas px-4 py-24 dark:bg-canvas-dark">
            {/* Keystead contour map in the plain space around the invitation */}
            <ContourMotif fragments={INVITATION_CONTOUR_FRAGMENTS} />
            <Link to="/" className="absolute top-6 left-6 md:left-10 z-10 flex items-center h-10">
                <Logo />
            </Link>
            <section className="relative mx-auto w-full max-w-xl rounded-xl border border-border bg-card p-8">
                {loading && <p className="text-slate-500 dark:text-slate-400">Loading invitation...</p>}
                {error && <p role="alert" className="mb-5 text-alert">{error}</p>}
                {invitation && <>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Invitation to apply</h1>
                    <p className="mt-3 text-slate-600 dark:text-slate-300">
                        {[invitation.landlord.firstName, invitation.landlord.lastName].filter(Boolean).join(' ') || 'A landlord'} invited {invitation.email} to apply for <strong>{invitation.property.name}</strong>.
                    </p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Expires {formatDateTime(invitation.expiresAt)}.</p>
                    {!isAuthenticated ? (
                        <div className="mt-6 flex gap-3">
                            <Link to="/auth/login" className="rounded-lg bg-brand-ink px-5 py-2.5 font-bold text-on-brand">Sign in</Link>
                            <Link to="/auth/signup/step1" className="rounded-lg border border-border-strong px-5 py-2.5 font-bold text-slate-700 dark:text-slate-200">Register</Link>
                        </div>
                    ) : user?.role !== 'TENANT' ? (
                        <p className="mt-6 text-pending">Sign in with a tenant account to accept this invitation.</p>
                    ) : (
                        <button onClick={accept} disabled={accepting || !!invitation.acceptedAt} className="mt-6 rounded-lg bg-brand-ink px-5 py-2.5 font-bold text-on-brand disabled:opacity-50">
                            {invitation.acceptedAt ? 'Invitation accepted' : accepting ? 'Accepting...' : 'Accept invitation'}
                        </button>
                    )}
                </>}
            </section>
        </main>
    );
}
