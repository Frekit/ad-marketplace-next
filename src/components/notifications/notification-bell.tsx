"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import Link from "next/link"
import NotificationItem from "./notification-item"

interface Notification {
    id: string
    type: string
    title: string
    message: string
    read: boolean
    created_at: string
    data?: Record<string, any>
}

interface NotificationBellProps {
    userId?: string
}

export default function NotificationBell({ userId }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [showDropdown, setShowDropdown] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (userId) {
            fetchNotifications()
        }
    }, [userId])

    // Auto-refresh notifications every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (userId) {
                fetchNotifications()
            }
        }, 30000)

        return () => clearInterval(interval)
    }, [userId])

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/notifications?limit=5&offset=0&unread_only=true')

            if (res.ok) {
                const data = await res.json()
                setNotifications(data.notifications)
                setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length)
            }
        } catch (error) {
            console.error("Error fetching notifications:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleMarkAsRead = async (notificationId: string, read: boolean) => {
        try {
            const res = await fetch(`/api/notifications/${notificationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ read })
            })

            if (res.ok) {
                setNotifications(notifications.map(n =>
                    n.id === notificationId ? { ...n, read } : n
                ))
                const newUnread = notifications
                    .map(n => n.id === notificationId ? { ...n, read } : n)
                    .filter(n => !n.read).length
                setUnreadCount(newUnread)
            }
        } catch (error) {
            console.error("Error updating notification:", error)
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 hover:bg-gray-100 rounded-full transition relative"
            >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-600 rounded-full"></span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 p-4 border-b bg-white rounded-t-lg flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                        <Link
                            href="/freelancer/notifications"
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            onClick={() => setShowDropdown(false)}
                        >
                            Ver todo
                        </Link>
                    </div>

                    {/* Notifications List */}
                    {loading ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            Cargando...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">Sin notificaciones nuevas</p>
                        </div>
                    ) : (
                        <div className="space-y-2 p-2">
                            {notifications.map((notification) => (
                                <div key={notification.id} className="p-2 hover:bg-gray-50 rounded">
                                    <NotificationItem
                                        {...notification}
                                        onMarkAsRead={handleMarkAsRead}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="sticky bottom-0 p-3 border-t bg-gray-50 rounded-b-lg">
                        <Link
                            href="/freelancer/notifications"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium block text-center"
                            onClick={() => setShowDropdown(false)}
                        >
                            Ver todas las notificaciones →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
