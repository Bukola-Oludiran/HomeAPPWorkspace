import { useState, useEffect, useRef } from 'react';
import { messageService } from '../../../lib/api/services/messageService';
import { useAuth } from '../../../contexts/AuthContext';
import type { Conversation, Message } from '../../../types/dashboard';

export default function TenantMessages() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [aiQuery, setAiQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch conversations on mount
    useEffect(() => {
        async function fetchConversations() {
            try {
                setIsLoadingConversations(true);
                const response = await messageService.getConversations();
                const data = response.data || [];
                setConversations(data);
                if (data.length > 0) {
                    setSelectedConversation(data[0]);
                }
            } catch (err) {
                console.error('Failed to fetch conversations:', err);
            } finally {
                setIsLoadingConversations(false);
            }
        }
        fetchConversations();
    }, []);

    // Fetch messages when selected conversation changes
    useEffect(() => {
        async function fetchMessages() {
            if (!selectedConversation) return;
            try {
                setIsLoadingMessages(true);
                const response = await messageService.getMessages(selectedConversation.id);
                const data = response.data || [];
                setMessages(data);
            } catch (err) {
                console.error('Failed to fetch messages:', err);
            } finally {
                setIsLoadingMessages(false);
            }
        }
        fetchMessages();
    }, [selectedConversation]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function handleSendMessage() {
        if (!newMessage.trim() || !selectedConversation || isSending) return;
        try {
            setIsSending(true);
            const response = await messageService.sendMessage(selectedConversation.id, { content: newMessage.trim() });
            setMessages(prev => [...prev, response.data]);
            setNewMessage('');
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setIsSending(false);
        }
    }

    function getOtherParticipant(conversation: Conversation) {
        return conversation.participants.find(p => p.userId !== user?.id) || conversation.participants[0];
    }

    function getParticipantInitials(participant: { firstName: string; lastName: string }) {
        return `${participant.firstName.charAt(0)}${participant.lastName.charAt(0)}`.toUpperCase();
    }

    function formatMessageTime(dateStr: string) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        if (diffDays === 1) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    const filteredConversations = conversations.filter(conv => {
        if (!searchQuery) return true;
        const other = getOtherParticipant(conv);
        const name = `${other.firstName} ${other.lastName}`.toLowerCase();
        return name.includes(searchQuery.toLowerCase());
    });

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
                        {isLoadingConversations ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="size-8 border-4 border-[#137fec] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <span className="material-symbols-outlined text-4xl mb-2">chat</span>
                                <p className="text-sm font-medium">No conversations yet</p>
                            </div>
                        ) : (
                            <ul className="flex flex-col">
                                {filteredConversations.map((conv) => {
                                    const other = getOtherParticipant(conv);
                                    const isActive = selectedConversation?.id === conv.id;
                                    const hasUnread = conv.unreadCount > 0;
                                    return (
                                        <li
                                            key={conv.id}
                                            onClick={() => setSelectedConversation(conv)}
                                            className={`cursor-pointer p-4 border-l-4 transition-colors ${isActive
                                                ? 'bg-blue-50/50 dark:bg-slate-800/50 border-[#137fec]'
                                                : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                                                } ${!isActive && !hasUnread ? 'opacity-70' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="relative">
                                                    {other.avatarUrl ? (
                                                        <img alt={`${other.firstName} ${other.lastName}`} className="size-12 rounded-full object-cover shrink-0" src={other.avatarUrl} />
                                                    ) : (
                                                        <div className="size-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 bg-[#137fec]/10 text-[#137fec]">
                                                            {getParticipantInitials(other)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{other.firstName} {other.lastName}</h3>
                                                        <span className={`text-xs whitespace-nowrap ${hasUnread ? 'text-[#137fec] font-bold' : 'text-slate-500 font-medium'}`}>
                                                            {conv.lastMessage ? formatMessageTime(conv.lastMessage.createdAt) : ''}
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm truncate ${hasUnread ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                                                        {conv.lastMessage?.content || 'No messages yet'}
                                                    </p>
                                                </div>
                                                {hasUnread && (
                                                    <div className="flex items-center">
                                                        <span className="size-2.5 bg-[#137fec] rounded-full"></span>
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </aside>

                {/* Chat View */}
                <section className="hidden md:flex flex-1 flex-col bg-white dark:bg-[#101922] rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative">
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#101922] border-b border-slate-200 dark:border-slate-800 z-20">
                                <div className="flex items-center gap-4">
                                    {(() => {
                                        const other = getOtherParticipant(selectedConversation);
                                        return (
                                            <>
                                                {other.avatarUrl ? (
                                                    <img alt={`${other.firstName} ${other.lastName}`} className="size-10 rounded-full object-cover" src={other.avatarUrl} />
                                                ) : (
                                                    <div className="size-10 rounded-full bg-[#137fec]/10 text-[#137fec] flex items-center justify-center font-bold text-sm">
                                                        {getParticipantInitials(other)}
                                                    </div>
                                                )}
                                                <div>
                                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{other.firstName} {other.lastName}</h2>
                                                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                        <span>{other.role}</span>
                                                        {selectedConversation.property && (
                                                            <>
                                                                <span className="mx-1">•</span>
                                                                <span>{selectedConversation.property.name}</span>
                                                            </>
                                                        )}
                                                    </span>
                                                </div>
                                            </>
                                        );
                                    })()}
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
                                {isLoadingMessages ? (
                                    <div className="flex items-center justify-center flex-1">
                                        <div className="size-8 border-4 border-[#137fec] border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center flex-1 text-slate-400">
                                        <span className="material-symbols-outlined text-4xl mb-2">chat_bubble_outline</span>
                                        <p className="text-sm font-medium">No messages yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((msg) => {
                                            const isMe = msg.senderId === user?.id;
                                            const sender = selectedConversation.participants.find(p => p.userId === msg.senderId);
                                            return (
                                                <div key={msg.id} className={`flex gap-4 max-w-[80%] ${isMe ? 'flex-row-reverse self-end' : ''}`}>
                                                    {!isMe ? (
                                                        <div className="size-8 rounded-full bg-[#137fec]/10 text-[#137fec] flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                                                            {sender ? getParticipantInitials(sender) : '?'}
                                                        </div>
                                                    ) : (
                                                        <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-1 overflow-hidden">
                                                            <span className="material-symbols-outlined text-slate-500 text-sm">person</span>
                                                        </div>
                                                    )}
                                                    <div className={`flex flex-col gap-1 ${isMe ? 'items-end' : ''}`}>
                                                        <div className={`p-4 rounded-2xl shadow-sm ${isMe
                                                            ? 'bg-[#137fec] text-white rounded-tr-sm'
                                                            : 'bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-tl-sm'
                                                            }`}>
                                                            <p className={`text-sm leading-relaxed ${isMe ? '' : 'text-slate-800 dark:text-slate-200'}`}>
                                                                {msg.content}
                                                            </p>
                                                        </div>
                                                        <span className={`text-[11px] text-slate-400 font-medium ${isMe ? 'mr-1' : 'ml-1'}`}>
                                                            {formatMessageTime(msg.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
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
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                        />
                                        <button className="mr-2 p-2 text-slate-400 hover:text-[#137fec] transition-colors rounded-lg">
                                            <span className="material-symbols-outlined text-[20px]">mood</span>
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={isSending || !newMessage.trim()}
                                        className="p-3 bg-[#137fec] hover:bg-[#137fec]/90 text-white rounded-xl shadow-lg shadow-[#137fec]/20 transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        <span className="material-symbols-outlined">send</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined text-6xl mb-3">forum</span>
                            <p className="text-lg font-medium">Select a conversation</p>
                            <p className="text-sm">Choose from your existing conversations to start messaging</p>
                        </div>
                    )}
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
                                    <p className="text-sm text-slate-700 dark:text-slate-300">How can I help you with your messages? I can help draft replies or summarize conversations.</p>
                                </div>
                            </div>
                            <div className="mt-auto">
                                <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide px-1">Suggested actions</p>
                                <div className="flex flex-wrap gap-2">
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors shadow-sm flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px] text-[#137fec]">summarize</span> Summarize chat
                                    </button>
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors shadow-sm flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px] text-[#137fec]">edit_note</span> Draft reply
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
