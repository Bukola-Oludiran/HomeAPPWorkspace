import { useState } from 'react';

// Mock conversation data
const conversations = [
    { id: 1, name: 'Robert Johnson', initials: 'RJ', role: 'Landlord', property: '5500 Highland Park, Unit 4B', lastMessage: "I've attached the lease renewal docs.", time: '10:42 AM', online: true, unread: false, active: true },
    { id: 2, name: 'Leasing Office', icon: 'apartment', lastMessage: 'Maintenance request update: Ticket #442...', time: 'Yesterday', online: true, unread: true, active: false },
    { id: 3, name: 'Sarah Miller (Agent)', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBLkek33Arklj-USfcZgsPPZBOtl1xgDJAc8qsaWZ51gxbtpP66zlBLUyVnWMpQ-RJU5fAKgdnj0tinIhcrgAuGWf_niUPah6-Hj6KCuAOZJ1oJeGLHdy_jbHn5xP6TCcvkQ0v6oV6MWpgzwG1uQh7warVguTEVUbQUB9wMrWkVh9U5_S11vnDM5dVGchCc5Fy0-1NtBVIsr5FxhqIlixEvd_nVwqEC79YUlQwHMv9eJt54ZPwjFYLaoQKEBsFjNqbqRuketxBrs4l', lastMessage: 'Thanks for your interest in the property.', time: 'Sep 28', online: false, unread: false, active: false },
    { id: 4, name: 'Main St. Properties', initials: 'MS', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', lastMessage: 'Your application has been approved!', time: 'Aug 15', online: false, unread: false, active: false },
];

const messages = [
    { id: 1, from: 'other', name: 'RJ', message: 'Hi Sarah, just checking in. Did the plumber come by to fix the faucet in the master bath?', time: '10:23 AM' },
    { id: 2, from: 'me', message: 'Hi Robert! Yes, he just left about 10 minutes ago. No more leaking. Thanks for getting that sorted so quickly!', time: '10:35 AM' },
    { id: 3, from: 'other', name: 'RJ', message: "Great to hear. Also, as we discussed, I've attached the lease renewal documents for next year. Let me know if you have questions.", time: '10:42 AM', attachment: { name: 'Lease_Renewal_2025.pdf', size: '2.4 MB', type: 'PDF' } },
];

export default function TenantMessages() {
    const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [aiQuery, setAiQuery] = useState('');

    return (
        <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 lg:p-8">
            <div className="flex flex-1 w-full h-full max-w-[1600px] mx-auto gap-6">
                {/* Conversation List Sidebar */}
                <aside className="w-full md:w-80 lg:w-96 flex flex-col bg-white dark:bg-[#101922] rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden z-10">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Messages</h1>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 group-focus-within:text-[#137fec] transition-colors">search</span>
                            <input
                                className="w-full bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] text-slate-900 dark:text-white placeholder:text-slate-400 transition-all shadow-sm"
                                placeholder="Search conversations..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <ul className="flex flex-col">
                            {conversations.map((conv) => (
                                <li
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={`cursor-pointer p-4 border-l-4 transition-colors ${conv.active
                                        ? 'bg-blue-50/50 dark:bg-slate-800/50 border-[#137fec]'
                                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                                        } ${!conv.active && !conv.unread ? 'opacity-70' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        <div className="relative">
                                            {conv.image ? (
                                                <img alt={conv.name} className="size-12 rounded-full object-cover shrink-0" src={conv.image} />
                                            ) : conv.icon ? (
                                                <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-[20px]">{conv.icon}</span>
                                                </div>
                                            ) : (
                                                <div className={`size-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${conv.color || 'bg-[#137fec]/10 text-[#137fec]'}`}>
                                                    {conv.initials}
                                                </div>
                                            )}
                                            {conv.online && (
                                                <span className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white dark:border-[#101922] rounded-full"></span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{conv.name}</h3>
                                                <span className={`text-xs whitespace-nowrap ${conv.unread ? 'text-[#137fec] font-bold' : 'text-slate-500 font-medium'}`}>{conv.time}</span>
                                            </div>
                                            <p className={`text-sm truncate ${conv.unread ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                                                {conv.lastMessage}
                                            </p>
                                        </div>
                                        {conv.unread && (
                                            <div className="flex items-center">
                                                <span className="size-2.5 bg-[#137fec] rounded-full"></span>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* Chat View */}
                <section className="hidden md:flex flex-1 flex-col bg-white dark:bg-[#101922] rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative">
                    {/* Chat Header */}
                    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#101922] border-b border-slate-200 dark:border-slate-800 z-20">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-full bg-[#137fec]/10 text-[#137fec] flex items-center justify-center font-bold text-sm">
                                {selectedConversation.initials || selectedConversation.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{selectedConversation.name}</h2>
                                {selectedConversation.role && (
                                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-[#137fec] transition-colors cursor-pointer">
                                        <span>{selectedConversation.role}</span>
                                        <span className="mx-1">•</span>
                                        <span>{selectedConversation.property}</span>
                                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="View Profile">
                                <span className="material-symbols-outlined">info</span>
                            </button>
                            <button className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Settings">
                                <span className="material-symbols-outlined">more_vert</span>
                            </button>
                        </div>
                    </header>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scroll-smooth relative z-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 2px, transparent 2px)', backgroundSize: '32px 32px' }}>
                        <div className="flex justify-center my-4">
                            <span className="px-3 py-1 bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full text-xs font-semibold text-slate-600 dark:text-slate-400 shadow-sm">
                                Today, Oct 24
                            </span>
                        </div>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-4 max-w-[80%] ${msg.from === 'me' ? 'flex-row-reverse self-end' : ''}`}>
                                {msg.from === 'other' ? (
                                    <div className="size-8 rounded-full bg-[#137fec]/10 text-[#137fec] flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                                        {msg.name}
                                    </div>
                                ) : (
                                    <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-1 overflow-hidden">
                                        <span className="material-symbols-outlined text-slate-500 text-sm">person</span>
                                    </div>
                                )}
                                <div className={`flex flex-col gap-1 ${msg.from === 'me' ? 'items-end' : ''}`}>
                                    <div className={`p-4 rounded-2xl shadow-sm ${msg.from === 'me'
                                        ? 'bg-[#137fec] text-white rounded-tr-sm'
                                        : 'bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-tl-sm'
                                        }`}>
                                        <p className={`text-sm leading-relaxed ${msg.from === 'me' ? '' : 'text-slate-800 dark:text-slate-200'}`}>
                                            {msg.message}
                                        </p>
                                        {msg.attachment && (
                                            <div className="flex items-center gap-3 p-3 mt-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group">
                                                <div className="size-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                                                    <span className="material-symbols-outlined">description</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{msg.attachment.name}</h4>
                                                    <p className="text-xs text-slate-500">{msg.attachment.size} • {msg.attachment.type}</p>
                                                </div>
                                                <button className="size-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-600 text-slate-400 group-hover:text-[#137fec] shadow-sm border border-slate-200 dark:border-slate-500">
                                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-[11px] text-slate-400 font-medium ${msg.from === 'me' ? 'mr-1' : 'ml-1'}`}>{msg.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 bg-white dark:bg-[#101922] border-t border-slate-200 dark:border-slate-800 z-20">
                        <div className="max-w-4xl mx-auto relative flex gap-3 items-end">
                            <button className="p-3 text-slate-400 hover:text-[#137fec] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0" title="Attach file">
                                <span className="material-symbols-outlined">attach_file</span>
                            </button>
                            <div className="flex-1 bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl focus-within:ring-2 focus-within:ring-[#137fec]/20 focus-within:border-[#137fec] transition-all flex items-center">
                                <textarea
                                    className="w-full bg-transparent border-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 py-3 px-4 resize-none h-[48px] max-h-[120px]"
                                    placeholder="Type your message..."
                                    rows={1}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button className="mr-2 p-2 text-slate-400 hover:text-[#137fec] transition-colors rounded-lg">
                                    <span className="material-symbols-outlined text-[20px]">mood</span>
                                </button>
                            </div>
                            <button className="p-3 bg-[#137fec] hover:bg-[#137fec]/90 text-white rounded-xl shadow-lg shadow-[#137fec]/20 transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center">
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Floating AI Assistant */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
                {/* AI Modal */}
                {isAiOpen && (
                    <div className="flex flex-col w-[360px] md:w-[420px] bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white dark:from-[#1e293b] dark:to-[#1e293b]">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-gradient-to-tr from-[#137fec] to-blue-400 flex items-center justify-center text-white shadow-md">
                                    <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">HomeAI Assistant</h3>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Context: Active Chat</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsAiOpen(false)}
                                className="cursor-pointer p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                        <div className="flex-1 p-4 h-[300px] overflow-y-auto flex flex-col gap-4 bg-slate-50/50 dark:bg-[#101922]/50">
                            <div className="flex gap-3">
                                <div className="size-8 rounded-full bg-gradient-to-tr from-[#137fec] to-blue-400 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                                    <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                                </div>
                                <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%]">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">I noticed Robert sent a lease renewal. Would you like me to summarize the key changes or draft a reply confirming receipt?</p>
                                </div>
                            </div>
                            <div className="mt-auto">
                                <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide px-1">Suggested actions</p>
                                <div className="flex flex-wrap gap-2">
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors shadow-sm flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px] text-[#137fec]">summarize</span> Summarize changes
                                    </button>
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors shadow-sm flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px] text-[#137fec]">edit_note</span> Draft confirmation
                                    </button>
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors shadow-sm">
                                        Ask about rent increase
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1e293b]">
                            <div className="relative flex items-center">
                                <input
                                    className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-[#101922] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#137fec]/20 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-inner"
                                    placeholder="Ask HomeAI..."
                                    type="text"
                                    value={aiQuery}
                                    onChange={(e) => setAiQuery(e.target.value)}
                                />
                                <button className="absolute right-2 p-1.5 bg-[#137fec] text-white rounded-lg hover:bg-[#137fec]/90 transition-colors shadow-md">
                                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Trigger Button */}
                {!isAiOpen && (
                    <button
                        onClick={() => setIsAiOpen(true)}
                        className="cursor-pointer group flex items-center gap-3 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white pl-1.5 pr-5 py-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-700 hover:scale-105 hover:shadow-[0_8px_30px_rgb(0,0,0,0.18)] transition-all duration-300"
                    >
                        <div className="size-10 rounded-full bg-gradient-to-tr from-[#137fec] to-blue-400 flex items-center justify-center text-white shadow-md group-hover:rotate-12 transition-transform">
                            <span className="material-symbols-outlined">smart_toy</span>
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-sm font-bold leading-none">Draft Reply...</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">AI suggestions ready</span>
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
}

