import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string
    alt?: string
    fallback?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
    ({ className, src, alt, fallback, size = 'md', ...props }, ref) => {
        const sizeClasses = {
            sm: 'size-8 text-xs',
            md: 'size-10 text-sm',
            lg: 'size-12 text-base',
            xl: 'size-16 text-lg',
        }

        const getInitials = (name?: string) => {
            if (!name) return '?'
            return name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }

        return (
            <div
                className={cn(
                    "relative overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300",
                    sizeClasses[size],
                    className
                )}
                ref={ref}
                {...props}
            >
                {src ? (
                    <img
                        src={src}
                        alt={alt || "Avatar"}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span>{getInitials(fallback)}</span>
                )}
            </div>
        )
    }
)
Avatar.displayName = "Avatar"

export { Avatar }
