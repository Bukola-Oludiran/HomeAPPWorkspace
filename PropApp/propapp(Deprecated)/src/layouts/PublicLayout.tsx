import { Outlet } from 'react-router-dom'
import { PublicNavbar } from '@/components/navigation/PublicNavbar'

interface PublicLayoutProps {
    user?: {
        name: string
        avatar?: string
    }
}

export function PublicLayout({ user }: PublicLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white overflow-x-hidden">
            <PublicNavbar user={user} />
            <main className="flex-1 flex flex-col pt-20">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

function Footer() {
    return (
        <footer className="bg-white dark:bg-[#101922] border-t border-slate-200 dark:border-slate-800 py-6 px-4 md:px-10 lg:px-20 text-center">
            <div className="flex flex-col md:flex-row items-center justify-between max-w-[1400px] mx-auto text-sm text-slate-500 dark:text-slate-400">
                <p>© 2024 PropertyApp. All rights reserved.</p>
                <div className="flex gap-4 mt-2 md:mt-0">
                    <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-primary transition-colors">Support</a>
                </div>
            </div>
        </footer>
    )
}
