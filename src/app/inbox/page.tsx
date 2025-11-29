"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mail, MessageSquare, Send, Loader2 } from "lucide-react"

type Message = {
    id: string
    conversation_id: string
    sender_id: string
    content: string
    read_at: string | null
    created_at: string
    users: {
        id: string
        first_name: string
        last_name: string
        email: string
    }
}

type Conversation = {
    id: string
    project_id: string | null
    other_participant: {
        id: string
        first_name: string
        last_name: string
        email: string
        role: string
    }
    last_message: Message | null
    unread_count: number
    last_message_at: string
    created_at: string
}

export default function InboxPage() {
    const router = useRouter()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string>("")
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Lazy initialize Supabase client to avoid pre-rendering errors
    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        loadConversations()
        getCurrentUser()
    }, [])

    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation.id)
            subscribeToMessages(selectedConversation.id)
        }
    }, [selectedConversation])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) setCurrentUserId(user.id)
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const loadConversations = async () => {
        try {
            const res = await fetch('/api/conversations')
            if (res.ok) {
                const data = await res.json()
                setConversations(data.conversations || [])
            }
        } catch (error) {
            console.error('Error loading conversations:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadMessages = async (conversationId: string) => {
        try {
            const res = await fetch(`/api/conversations/${conversationId}/messages`)
            if (res.ok) {
                const data = await res.json()
                setMessages(data.messages || [])
            }
        } catch (error) {
            console.error('Error loading messages:', error)
        }
    }

    const subscribeToMessages = (conversationId: string) => {
        const channel = supabase
            .channel(`messages:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    const newMsg = payload.new as Message
                    setMessages(prev => [...prev, newMsg])
                    loadConversations() // Refresh to update last message
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }

    const sendMessage = async () => {
        if (!selectedConversation || !newMessage.trim()) return

        setSending(true)
        try {
            const res = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage })
            })

            if (res.ok) {
                setNewMessage("")
                // Message will be added via real-time subscription
            }
        } catch (error) {
            console.error('Error sending message:', error)
        } finally {
            setSending(false)
        }
    }

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Ahora'
        if (diffMins < 60) return `${diffMins}m`
        if (diffHours < 24) return `${diffHours}h`
        if (diffDays < 7) return `${diffDays}d`
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#FF5C5C]" />
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Conversations Sidebar */}
            <div className="w-80 border-r bg-white flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Mensajes</h2>
                </div>

                <ScrollArea className="flex-1">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center">
                            <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-sm text-gray-500 font-medium">Bandeja de entrada vacía</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {conversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className="bg-[#FF5C5C] text-white">
                                                {getInitials(
                                                    conv.other_participant?.first_name || '',
                                                    conv.other_participant?.last_name || ''
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="font-semibold text-gray-900 truncate">
                                                    {conv.other_participant?.first_name} {conv.other_participant?.last_name}
                                                </p>
                                                {conv.last_message && (
                                                    <span className="text-xs text-gray-500">
                                                        {formatTime(conv.last_message.created_at)}
                                                    </span>
                                                )}
                                            </div>
                                            {conv.last_message && (
                                                <p className="text-sm text-gray-600 truncate">
                                                    {conv.last_message.content}
                                                </p>
                                            )}
                                            {conv.unread_count > 0 && (
                                                <Badge className="mt-1 bg-[#FF5C5C]">
                                                    {conv.unread_count} nuevo{conv.unread_count !== 1 ? 's' : ''}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b bg-white flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-[#FF5C5C] text-white">
                                    {getInitials(
                                        selectedConversation.other_participant?.first_name || '',
                                        selectedConversation.other_participant?.last_name || ''
                                    )}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    {selectedConversation.other_participant?.first_name}{' '}
                                    {selectedConversation.other_participant?.last_name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {selectedConversation.other_participant?.role === 'client' ? 'Cliente' : 'Freelancer'}
                                </p>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.map((message) => {
                                    const isOwnMessage = message.sender_id === currentUserId
                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-lg px-4 py-2 ${isOwnMessage
                                                    ? 'bg-[#FF5C5C] text-white'
                                                    : 'bg-gray-200 text-gray-900'
                                                    }`}
                                            >
                                                <p className="text-sm">{message.content}</p>
                                                <p
                                                    className={`text-xs mt-1 ${isOwnMessage ? 'text-white/70' : 'text-gray-500'
                                                        }`}
                                                >
                                                    {formatTime(message.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        {/* Message Input */}
                        <div className="p-4 border-t bg-white">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Escribe un mensaje..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                    disabled={sending}
                                />
                                <Button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim() || sending}
                                    className="bg-[#FF5C5C] hover:bg-[#FF5C5C]/90 text-white"
                                >
                                    {sending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center max-w-md px-4">
                            <div className="mb-6">
                                <div className="inline-block p-6 bg-white rounded-full shadow-sm mb-4">
                                    <MessageSquare className="h-12 w-12 text-gray-300" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Selecciona una conversación
                            </h2>
                            <p className="text-gray-600">
                                Elige una conversación de la lista para comenzar a chatear.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
