"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import ConversationItem from "@/components/messaging/conversation-item"
import MessageBubble from "@/components/messaging/message-bubble"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, MessageCircle, Send } from "lucide-react"

interface User {
    id: string
    first_name: string
    last_name: string
    email: string
    role: string
}

interface Message {
    id: string
    conversation_id: string
    sender_id: string
    content: string
    read_at?: string
    created_at: string
    users?: User
}

interface Conversation {
    id: string
    project_id?: string
    other_participant: User
    last_message?: Message
    unread_count: number
    last_message_at: string
    created_at: string
}

export default function MessagesContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const freelancerId = searchParams.get('freelancer_id')

    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            router.push("/sign-in")
        },
    })

    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [sendingMessage, setSendingMessage] = useState(false)
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (session?.user?.id) {
            fetchConversations()
        }
    }, [session?.user?.id])

    // If freelancer_id is in URL, find or create conversation with that freelancer
    useEffect(() => {
        if (freelancerId && conversations.length > 0) {
            // Try to find existing conversation with this freelancer
            const existingConversation = conversations.find(conv => conv.other_participant.id === freelancerId)
            if (existingConversation) {
                setSelectedConversationId(existingConversation.id)
            } else {
                // If no conversation exists, create one
                createConversation(freelancerId)
            }
        }
    }, [freelancerId, conversations])

    useEffect(() => {
        if (selectedConversationId) {
            fetchMessages(selectedConversationId)
        }
    }, [selectedConversationId])

    // Auto-refresh messages every 3 seconds
    useEffect(() => {
        if (!selectedConversationId) return

        const interval = setInterval(() => {
            fetchMessages(selectedConversationId)
        }, 3000)

        return () => clearInterval(interval)
    }, [selectedConversationId])

    const fetchConversations = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/conversations")

            if (!res.ok) {
                throw new Error("Failed to fetch conversations")
            }

            const data = await res.json()
            setConversations(data.conversations)

            // Auto-select first conversation
            if (data.conversations.length > 0 && !selectedConversationId) {
                setSelectedConversationId(data.conversations[0].id)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error loading conversations")
            console.error("Error fetching conversations:", err)
        } finally {
            setLoading(false)
        }
    }

    const fetchMessages = async (conversationId: string) => {
        try {
            setLoadingMessages(true)
            const res = await fetch(`/api/conversations/${conversationId}/messages`)

            if (!res.ok) {
                throw new Error("Failed to fetch messages")
            }

            const data = await res.json()
            setMessages(data.messages)
        } catch (err) {
            console.error("Error fetching messages:", err)
        } finally {
            setLoadingMessages(false)
        }
    }

    const createConversation = async (otherUserId: string) => {
        try {
            const res = await fetch("/api/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    other_user_id: otherUserId
                })
            })

            if (!res.ok) {
                throw new Error("Failed to create conversation")
            }

            const data = await res.json()
            if (data.conversation?.id) {
                setSelectedConversationId(data.conversation.id)
                await fetchConversations()
            }
        } catch (err) {
            console.error("Error creating conversation:", err)
            setError(err instanceof Error ? err.message : "Error creating conversation")
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!newMessage.trim() || !selectedConversationId) {
            return
        }

        try {
            setSendingMessage(true)
            const res = await fetch(`/api/conversations/${selectedConversationId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newMessage })
            })

            if (!res.ok) {
                throw new Error("Failed to send message")
            }

            setNewMessage("")
            // Refresh messages
            await fetchMessages(selectedConversationId)
            // Refresh conversations
            await fetchConversations()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error sending message")
            console.error("Error sending message:", err)
        } finally {
            setSendingMessage(false)
        }
    }

    const selectedConversation = conversations.find(c => c.id === selectedConversationId)

    if (status === "loading" || loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <div className="flex-1 flex overflow-hidden">
                {/* Conversations List */}
                <div className="w-full md:w-80 border-r bg-white overflow-y-auto">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-bold text-gray-900">Mensajes</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {conversations.length} {conversations.length === 1 ? 'conversación' : 'conversaciones'}
                        </p>
                    </div>

                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No tienes mensajes todavía</p>
                        </div>
                    ) : (
                        <div className="space-y-2 p-2">
                            {conversations.map((conversation) => (
                                <ConversationItem
                                    key={conversation.id}
                                    {...conversation}
                                    onClick={() => setSelectedConversationId(conversation.id)}
                                    isSelected={conversation.id === selectedConversationId}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Messages View */}
                {selectedConversation ? (
                    <div className="flex-1 flex flex-col bg-gray-50">
                        {/* Header */}
                        <div className="p-4 border-b bg-white">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {selectedConversation.other_participant.first_name} {selectedConversation.other_participant.last_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {selectedConversation.other_participant.role === 'freelancer' ? '👨‍💻 Freelancer' : '🏢 Cliente'}
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="px-4 py-2 bg-red-50 text-red-800 text-sm border-b border-red-200">
                                {error}
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loadingMessages ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <p>Comienza la conversación</p>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <MessageBubble
                                        key={message.id}
                                        {...message}
                                        sender={message.users!}
                                        isOwn={message.sender_id === session?.user?.id}
                                    />
                                ))
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t bg-white">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input
                                    type="text"
                                    placeholder="Escribe un mensaje..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    disabled={sendingMessage}
                                    className="flex-1"
                                />
                                <Button
                                    type="submit"
                                    disabled={!newMessage.trim() || sendingMessage}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {sendingMessage ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center text-gray-500">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>Selecciona una conversación para comenzar</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
