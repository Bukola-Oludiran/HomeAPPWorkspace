import { Outlet } from 'react-router-dom'
import { DashboardNavbar } from '@/components/navigation/DashboardNavbar'
import { FloatingAIBar } from '@/components/navigation/FloatingAIBar'

interface DashboardLayoutProps {
    variant: 'landlord' | 'tenant' | 'agent'
    user?: {
        name: string
        avatar?: string
    }
}

export function DashboardLayout({ variant, user }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white overflow-x-hidden">
            <DashboardNavbar variant={variant} user={user} />
            <main className="flex-1 flex flex-col py-8 px-4 md:px-10 lg:px-20 pb-32">
                <div className="max-w-[1400px] w-full mx-auto">
                    <Outlet />
                </div>
            </main>
            <FloatingAIBar variant={variant === 'agent' ? 'agent' : 'home'} />
        </div>
    )
}
