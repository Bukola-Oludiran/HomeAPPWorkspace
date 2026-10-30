import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
    label: string;
    href?: string; // if undefined, treated as current page (last item)
}

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    breadcrumb?: BreadcrumbItem[];
    className?: string;
}

/**
 * PageHeader - A reusable page header component with optional breadcrumb and action buttons.
 * 
 * Usage:
 * <PageHeader 
 *   title="Dashboard"
 *   subtitle="Welcome back. Here's what's happening today."
 *   actions={<Button>Add new</Button>}
 *   breadcrumb={[{ label: "Home", href: "/" }, { label: "Dashboard" }]}
 * />
 */
export default function PageHeader({ title, subtitle, actions, breadcrumb, className = '' }: PageHeaderProps) {
    return (
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 ${className}`}>
            <div>
                {/* Breadcrumb */}
                {breadcrumb && breadcrumb.length > 0 && (
                    <nav className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                        {breadcrumb.map((item, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && (
                                    <span className="material-symbols-outlined text-[16px] text-slate-800 dark:text-slate-400">
                                        chevron_right
                                    </span>
                                )}
                                {item.href ? (
                                    <Link
                                        to={item.href}
                                        className="hover:text-brand-ink transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span className="text-slate-900 dark:text-white">{item.label}</span>
                                )}
                            </React.Fragment>
                        ))}
                    </nav>
                )}

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {title}
                </h1>

                {/* Subtitle */}
                {subtitle && (
                    <p className="text-slate-800 dark:text-slate-400 mt-2 text-lg">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Actions */}
            {actions && (
                <div className="flex gap-3 items-center">
                    {actions}
                </div>
            )}
        </div>
    );
}
