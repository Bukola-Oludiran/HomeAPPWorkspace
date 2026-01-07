import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'

interface Message {
    id: string
    text: string
    timestamp: string
    isOwn: boolean
}

interface Conversation {
    id: string
    name: string
    role: string
    lastMessage: string
    timestamp: string
    unread: number
    property?: string
}

export function TenantMessages() {
    const [selectedConversation, setSelectedConversation] = useState<string | null>('1')
    const [newMessage, setNewMessage] = useState('')

    const conversations: Conversation[] = [
        {
            id: '1',
            name: 'Robert Johnson',
            role: 'Landlord',
            lastMessage: 'The plumber will be there tomorrow at 2 PM.',
            timestamp: '2 hrs ago',
            unread: 2,
            property: '5500 Highland Park, Unit 4B',
        },
        {
            id: '2',
            name: 'PropertyApp Support',
            role: 'Support',
            lastMessage: 'Your payment has been confirmed.',
            timestamp: 'Yesterday',
            unread: 0,
        },
        {
            id: '3',
            name: 'James Wilson',
            role: 'Agent',
            lastMessage: 'I can show you the property on Saturday.',
            timestamp: '3 days ago',
            unread: 0,
            property: '1243 Oakwood Avenue',
        },
    ]

    const messages: Message[] = [
        { id: '1', text: 'Hi Robert, the kitchen faucet has been leaking since yesterday.', timestamp: '10:30 AM', isOwn: true },
        { id: '2', text: 'Thanks for letting me know! I\'ll send a plumber to take a look.', timestamp: '11:15 AM', isOwn: false },
        { id: '3', text: 'When can they come?', timestamp: '11:20 AM', isOwn: true },
        { id: '4', text: 'The plumber will be there tomorrow at 2 PM. Please make sure someone is home.', timestamp: '2:45 PM', isOwn: false },
    ]

    const selectedConvo = conversations.find(c => c.id === selectedConversation)

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            // Handle send
            setNewMessage('')
        }
    }

    return (
        <div className="h-[calc(100vh-180px)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Messages
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                        Stay in touch with your landlord and agents
                    </p>
                </div>
            </div>

            {/* Messages Container */}
            <Card className="flex-1 flex overflow-hidden">
                {/* Conversations List */}
                <div className="w-full md:w-80 border-r border-slate-100 dark:border-slate-700 flex flex-col">
                    {/* Search */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                        <Input
                            icon={<span className="material-symbols-outlined text-[18px]">search</span>}
                            placeholder="Search messages..."
                        />
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto">
                        {conversations.map((convo) => (
                            <button
                                key={convo.id}
                                onClick={() => setSelectedConversation(convo.id)}
                                className={`w-full p-4 flex gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800 ${selectedConversation === convo.id ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                                    }`}
                            >
                                <Avatar fallback={convo.name} size="md" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white truncate">{convo.name}</p>
                                            <p className="text-xs text-slate-500">{convo.role}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-xs text-slate-400">{convo.timestamp}</span>
                                            {convo.unread > 0 && (
                                                <span className="size-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                                                    {convo.unread}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500 truncate mt-1">{convo.lastMessage}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="hidden md:flex flex-1 flex-col">
                    {selectedConvo ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar fallback={selectedConvo.name} size="md" />
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">{selectedConvo.name}</p>
                                        <p className="text-xs text-slate-500">{selectedConvo.role}</p>
                                    </div>
                                </div>
                                {selectedConvo.property && (
                                    <Badge variant="default" className="hidden lg:flex">
                                        <span className="material-symbols-outlined text-[14px]">home</span>
                                        {selectedConvo.property}
                                    </Badge>
                                )}
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.isOwn
                                                    ? 'bg-primary text-white rounded-br-none'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none'
                                                }`}
                                        >
                                            <p className="text-sm">{msg.text}</p>
                                            <p className={`text-xs mt-1 ${msg.isOwn ? 'text-white/70' : 'text-slate-400'}`}>
                                                {msg.timestamp}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                                <div className="flex gap-3">
                                    <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                        <span className="material-symbols-outlined">attach_file</span>
                                    </button>
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    />
                                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                                        <span className="material-symbols-outlined text-[18px]">send</span>
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* No conversation selected */
                        <div className="flex-1 flex items-center justify-center text-center p-8">
                            <div>
                                <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-slate-400 text-3xl">chat</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                    Select a conversation
                                </h3>
                                <p className="text-slate-500">Choose from your existing conversations</p>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}
