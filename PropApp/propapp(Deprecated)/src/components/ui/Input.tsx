import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode
    iconPosition?: 'left' | 'right'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, icon, iconPosition = 'left', type, ...props }, ref) => {
        if (icon) {
            return (
                <div className="relative flex items-center">
                    {iconPosition === 'left' && (
                        <span className="absolute left-3 text-slate-400">
                            {icon}
                        </span>
                    )}
                    <input
                        type={type}
                        className={cn(
                            "flex-1 h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors",
                            iconPosition === 'left' ? 'pl-10 pr-4' : 'pl-4 pr-10',
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                    {iconPosition === 'right' && (
                        <span className="absolute right-3 text-slate-400">
                            {icon}
                        </span>
                    )}
                </div>
            )
        }

        return (
            <input
                type={type}
                className={cn(
                    "flex h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
