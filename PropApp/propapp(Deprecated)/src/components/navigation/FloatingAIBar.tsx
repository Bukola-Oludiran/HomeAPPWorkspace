import { useState } from 'react'

interface FloatingAIBarProps {
    variant?: 'home' | 'agent'
    suggestedActions?: string[]
}

export function FloatingAIBar({
    variant = 'home',
    suggestedActions = ['Report a leak', "When is rent due?", 'Message landlord']
}: FloatingAIBarProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')

    const titles = {
        home: { title: 'HomeAI Assistant', subtitle: 'Powered by PropertyApp', placeholder: 'Ask HomeAI...' },
        agent: { title: 'AgentAI Assistant', subtitle: 'Job & Schedule Helper', placeholder: 'Ask AgentAI...' }
    }

    const config = titles[variant]

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
            {/* Expanded Modal */}
            {isOpen && (
                <div className="flex flex-col w-[360px] md:w-[420px] bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transform transition-all duration-300 origin-bottom-right">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white dark:from-[#1e293b] dark:to-[#1e293b]">
                        <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white shadow-md">
                                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{config.title}</h3>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                                    {config.subtitle}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 p-4 h-[300px] overflow-y-auto custom-scrollbar flex flex-col gap-4 bg-slate-50/50 dark:bg-[#101922]/50">
                        {/* AI Greeting */}
                        <div className="flex gap-3">
                            <div className="size-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                                <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                            </div>
                            <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%]">
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                    Hello! I'm your personal property assistant. How can I help you today?
                                </p>
                            </div>
                        </div>

                        {/* Suggested Actions */}
                        <div className="mt-auto">
                            <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide px-1">
                                Suggested actions
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {suggestedActions.map((action) => (
                                    <button
                                        key={action}
                                        onClick={() => setInputValue(action)}
                                        className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors shadow-sm"
                                    >
                                        {action}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1e293b]">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={config.placeholder}
                                className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-[#101922] border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-inner"
                            />
                            <button className="absolute right-2 p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-md">
                                <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Trigger Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group flex items-center gap-3 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white pl-1.5 pr-5 py-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-700 hover:scale-105 hover:shadow-[0_8px_30px_rgb(0,0,0,0.18)] transition-all duration-300"
                >
                    <div className="size-10 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white shadow-md group-hover:rotate-12 transition-transform">
                        <span className="material-symbols-outlined">smart_toy</span>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-bold leading-none">
                            {variant === 'agent' ? 'Job Assistant...' : 'Ask HomeAI...'}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
                            Click to chat
                        </span>
                    </div>
                </button>
            )}
        </div>
    )
}
