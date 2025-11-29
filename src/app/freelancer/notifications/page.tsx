"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import FreelancerLayout from "@/components/layouts/FreelancerLayout"
import NotificationItem from "@/components/notifications/notification-item"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Bell, FilterX } from "lucide-react"

interface Notification {
    id: string
    type: string
    title: string
    message: string
    read: boolean
    created_at: string
    data?: Record<string, any>
}

interface NotificationsResponse {
    notifications: Notification[]
    total: number
    limit: number
    offset: number
}

export default function FreelancerNotificationsPage() {
    const router = useRouter()
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            router.push("/sign-in")
        },
    })

    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [showUnreadOnly, setShowUnreadOnly] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (session?.user?.id) {
            fetchNotifications()
        }
    }, [session?.user?.id, showUnreadOnly])

    // Auto-refresh notifications every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (session?.user?.id) {
                fetchNotifications()
            }
        }, 10000)

        return () => clearInterval(interval)
    }, [session?.user?.id, showUnreadOnly])

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                limit: '50',
                offset: '0',
                unread_only: showUnreadOnly.toString()
            })

            const res = await fetch(`/api/notifications?${params}`)

            if (!res.ok) {
                throw new Error("Failed to fetch notifications")
            }

            const data: NotificationsResponse = await res.json()
            setNotifications(data.notifications)
            setTotal(data.total)
            setUnreadCount(data.notifications.filter(n => !n.read).length)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error loading notifications")
            console.error("Error fetching notifications:", err)
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

            if (!res.ok) {
                throw new Error("Failed to update notification")
            }

            // Update local state
            setNotifications(notifications.map(n =>
                n.id === notificationId ? { ...n, read } : n
            ))

            // Recalculate unread count
            const newUnreadCount = notifications
                .map(n => n.id === notificationId ? { ...n, read } : n)
                .filter(n => !n.read).length
            setUnreadCount(newUnreadCount)
        } catch (err) {
            console.error("Error updating notification:", err)
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            const res = await fetch('/api/notifications/mark-all-read', {
                method: 'POST'
            })

            if (!res.ok) {
                throw new Error("Failed to mark all as read")
            }

            // Refresh notifications
            await fetchNotifications()
        } catch (err) {
            console.error("Error marking all as read:", err)
        }
    }

    const handleDelete = async (notificationId: string) => {
        try {
            // For now, we'll just mark it as read since delete isn't implemented
            await handleMarkAsRead(notificationId, true)
        } catch (err) {
            console.error("Error deleting notification:", err)
        }
    }

    if (status === "loading" || loading) {
        return (
            <FreelancerLayout>
                <div className="p-8 flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            </FreelancerLayout>
        )
    }

    const displayNotifications = showUnreadOnly
        ? notifications.filter(n => !n.read)
        : notifications

    return (
        <FreelancerLayout>
            <div className="p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
                            <p className="text-gray-600 mt-2">
                                Tienes {unreadCount} notificación{unreadCount !== 1 ? 'es' : ''} sin leer
                            </p>
                        </div>

                        {unreadCount > 0 && (
                            <Button
                                onClick={handleMarkAllAsRead}
                                variant="outline"
                                className="text-sm"
                            >
                                Marcar todo como leído
                            </Button>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <Card className="p-4 bg-red-50 border-red-200 text-red-800">
                            {error}
                        </Card>
                    )}

                    {/* Filter Buttons */}
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                            variant={showUnreadOnly ? "default" : "outline"}
                            className={showUnreadOnly ? "bg-blue-600" : ""}
                        >
                            {showUnreadOnly ? (
                                <>
                                    <FilterX className="h-4 w-4 mr-2" />
                                    Mostrar todos ({total})
                                </>
                            ) : (
                                <>
                                    <Bell className="h-4 w-4 mr-2" />
                                    Sin leer ({unreadCount})
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Notifications List */}
                    {displayNotifications.length === 0 ? (
                        <Card className="p-12 text-center">
                            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                {showUnreadOnly ? 'Sin notificaciones sin leer' : 'Sin notificaciones'}
                            </h2>
                            <p className="text-gray-600">
                                {showUnreadOnly
                                    ? 'Todas tus notificaciones han sido leídas'
                                    : 'No tienes notificaciones en este momento'
                                }
                            </p>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {displayNotifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    {...notification}
                                    onMarkAsRead={handleMarkAsRead}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </FreelancerLayout>
    )
}
