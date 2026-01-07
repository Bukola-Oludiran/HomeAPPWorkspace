import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center gap-2 font-bold transition-all rounded-lg disabled:opacity-50 disabled:pointer-events-none",
                    // Size variants
                    {
                        'px-3 py-1.5 text-xs': size === 'sm',
                        'px-4 py-2.5 text-sm': size === 'md',
                        'px-6 py-3 text-base': size === 'lg',
                    },
                    // Style variants
                    {
                        'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20': variant === 'primary',
                        'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300': variant === 'secondary',
                        'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-primary hover:text-primary': variant === 'outline',
                        'text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800': variant === 'ghost',
                        'bg-red-600 hover:bg-red-700 text-white': variant === 'danger',
                    },
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
