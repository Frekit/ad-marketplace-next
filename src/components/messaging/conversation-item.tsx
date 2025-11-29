"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface User {
    id: string
    first_name: string
    last_name: string
    email: string
    role: string
}

interface Message {
    id: string
    content: string
    sender_id: string
    created_at: string
    read_at?: string
}

interface ConversationItemProps {
    id: string
    other_participant: User
    last_message?: Message
    unread_count: number
    onClick: () => void
    isSelected?: boolean
}

function getInitials(firstName: string, lastName: string): string {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

function getTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
        return `${diffMins}m`
    } else if (diffHours < 24) {
        return `${diffHours}h`
    } else if (diffDays < 7) {
        return `${diffDays}d`
    } else {
        return date.toLocaleDateString('es-ES', {
            month: 'short',
            day: 'numeric'
        })
    }
}

export default function ConversationItem({
    id,
    other_participant,
    last_message,
    unread_count,
    onClick,
    isSelected = false,
}: ConversationItemProps) {
    const initials = getInitials(other_participant.first_name, other_participant.last_name)
    const lastMessageText = last_message?.content || 'No messages yet'
    const lastMessageTime = last_message?.created_at ? getTimeAgo(last_message.created_at) : ''

    return (
        <Card
            onClick={onClick}
            className={`p-4 cursor-pointer transition-colors ${isSelected
                ? 'bg-blue-50 border-blue-200'
                : 'hover:bg-gray-50'
                }`}
        >
            <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm font-semibold">
                        {initials}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                            {other_participant.first_name} {other_participant.last_name}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                            {lastMessageTime}
                        </span>
                    </div>

                    <p className="text-sm text-gray-600 truncate mb-2">
                        {lastMessageText}
                    </p>

                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                            {other_participant.role === 'freelancer' ? '👨‍💻 Freelancer' : '🏢 Cliente'}
                        </Badge>
                        {unread_count > 0 && (
                            <Badge className="bg-blue-600 text-white">
                                {unread_count}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    )
}
