import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
    /** Label to display */
    label: string;
    /** Link href - if undefined, treated as current page (no link) */
    href?: string;
}

interface BreadcrumbProps {
    /** Array of breadcrumb items */
    items: BreadcrumbItem[];
    /** Additional className for customization */
    className?: string;
}

/**
 * Breadcrumb - A reusable navigation breadcrumb component
 * Supports multiple levels with automatic styling for current page
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({
    items,
    className = '',
}) => {
    return (
        <nav aria-label="Breadcrumb" className={`flex mb-6 ${className}`}>
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                {items.map((item, index) => (
                    <li key={index} className="inline-flex items-center">
                        {index > 0 && (
                            <span className="material-symbols-outlined text-slate-800 dark:text-slate-400 text-lg mx-1">
                                chevron_right
                            </span>
                        )}
                        {item.href ? (
                            <Link
                                to={item.href}
                                className="inline-flex items-center text-sm font-medium text-slate-800 hover:text-brand dark:text-slate-400 dark:hover:text-white"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
