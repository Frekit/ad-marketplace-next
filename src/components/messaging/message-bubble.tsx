"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Sender {
    id: string
    first_name: string
    last_name: string
    email: string
}

interface MessageBubbleProps {
    id: string
    content: string
    sender: Sender
    created_at: string
    isOwn: boolean
    read_at?: string
}

function getInitials(firstName: string, lastName: string): string {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

function formatTime(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    })
}

export default function MessageBubble({
    id,
    content,
    sender,
    created_at,
    isOwn,
    read_at,
}: MessageBubbleProps) {
    const initials = getInitials(sender.first_name, sender.last_name)
    const time = formatTime(created_at)

    return (
        <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            {!isOwn && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs font-semibold">
                        {initials}
                    </AvatarFallback>
                </Avatar>
            )}

            <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                <div
                    className={`px-4 py-2 rounded-lg max-w-xs ${isOwn
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                        }`}
                >
                    <p className="text-sm break-words">{content}</p>
                </div>

                <span className={`text-xs mt-1 ${isOwn ? 'text-gray-500' : 'text-gray-400'}`}>
                    {time}
                    {isOwn && read_at && (
                        <span className="ml-1">✓✓</span>
                    )}
                </span>
            </div>
        </div>
    )
}
