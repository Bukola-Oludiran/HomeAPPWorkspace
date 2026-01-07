import * as React from "react"
import { cn } from "@/lib/utils"

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
    value: string | number
    icon: string
    iconBgColor?: string
    iconColor?: string
    badge?: React.ReactNode
    subtext?: string
    trend?: {
        value: string
        isPositive: boolean
    }
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
    ({ className, title, value, icon, iconBgColor = 'bg-blue-50 dark:bg-blue-900/20', iconColor = 'text-blue-600 dark:text-blue-400', badge, subtext, trend, ...props }, ref) => {
        return (
            <div
                className={cn(
                    "bg-white dark:bg-[#101922] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between",
                    className
                )}
                ref={ref}
                {...props}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-3 rounded-xl", iconBgColor, iconColor)}>
                        <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    {trend && (
                        <span className={cn(
                            "flex items-center text-xs font-bold px-2 py-1 rounded-md",
                            trend.isPositive
                                ? "text-green-600 bg-green-50 dark:bg-green-900/20"
                                : "text-red-600 bg-red-50 dark:bg-red-900/20"
                        )}>
                            <span className="material-symbols-outlined text-[14px] mr-0.5">
                                {trend.isPositive ? 'trending_up' : 'trending_down'}
                            </span>
                            {trend.value}
                        </span>
                    )}
                    {badge && !trend && badge}
                </div>
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
                    <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{value}</h3>
                    {subtext && (
                        <p className="text-xs text-slate-400 mt-1">{subtext}</p>
                    )}
                </div>
            </div>
        )
    }
)
StatCard.displayName = "StatCard"

export { StatCard }
