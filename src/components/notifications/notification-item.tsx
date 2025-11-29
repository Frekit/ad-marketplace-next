"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Bell,
    CheckCircle,
    AlertCircle,
    MessageCircle,
    Gift,
    Shield,
    Trash2
} from "lucide-react"

interface NotificationItemProps {
    id: string
    type: string
    title: string
    message: string
    read: boolean
    created_at: string
    data?: Record<string, any>
    onMarkAsRead?: (id: string, read: boolean) => void
    onDelete?: (id: string) => void
}

function getNotificationIcon(type: string) {
    switch (type) {
        case 'invoice_approved':
            return <CheckCircle className="h-5 w-5 text-green-600" />
        case 'invoice_rejected':
            return <AlertCircle className="h-5 w-5 text-red-600" />
        case 'milestone_completed':
            return <CheckCircle className="h-5 w-5 text-blue-600" />
        case 'project_invitation':
            return <Gift className="h-5 w-5 text-purple-600" />
        case 'payment_received':
            return <CheckCircle className="h-5 w-5 text-green-600" />
        case 'verification_completed':
            return <Shield className="h-5 w-5 text-yellow-600" />
        default:
            return <Bell className="h-5 w-5 text-gray-600" />
    }
}

function getNotificationColor(type: string): string {
    switch (type) {
        case 'invoice_approved':
        case 'payment_received':
        case 'milestone_completed':
            return 'bg-green-50 border-green-200'
        case 'invoice_rejected':
            return 'bg-red-50 border-red-200'
        case 'project_invitation':
            return 'bg-purple-50 border-purple-200'
        case 'verification_completed':
            return 'bg-yellow-50 border-yellow-200'
        default:
            return 'bg-blue-50 border-blue-200'
    }
}

function formatTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
        return `hace ${diffMins} min`
    } else if (diffHours < 24) {
        return `hace ${diffHours}h`
    } else if (diffDays < 7) {
        return `hace ${diffDays}d`
    } else {
        return date.toLocaleDateString('es-ES')
    }
}

function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        invoice_approved: 'Factura aprobada',
        invoice_rejected: 'Factura rechazada',
        milestone_completed: 'Hito completado',
        project_invitation: 'Invitación a proyecto',
        payment_received: 'Pago recibido',
        verification_completed: 'Verificación completada'
    }
    return labels[type] || type
}

export default function NotificationItem({
    id,
    type,
    title,
    message,
    read,
    created_at,
    data,
    onMarkAsRead,
    onDelete,
}: NotificationItemProps) {
    const timeAgo = formatTime(created_at)

    return (
        <Card
            className={`p-4 transition-all ${read
                ? 'bg-white border-gray-200'
                : `${getNotificationColor(type)}`
                }`}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(type)}
                </div>

                <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className={`font-semibold ${read ? 'text-gray-700' : 'text-gray-900'}`}>
                                {title}
                            </h3>
                            <p className={`text-sm mt-1 ${read ? 'text-gray-500' : 'text-gray-700'}`}>
                                {message}
                            </p>
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                            {timeAgo}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className="text-xs">
                            {getTypeLabel(type)}
                        </Badge>
                        {!read && <span className="h-2 w-2 bg-blue-600 rounded-full"></span>}
                    </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                    {!read && onMarkAsRead && (
                        <button
                            onClick={() => onMarkAsRead(id, true)}
                            className="p-1 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-900"
                            title="Marcar como leído"
                        >
                            <CheckCircle className="h-4 w-4" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(id)}
                            className="p-1 hover:bg-red-100 rounded text-gray-600 hover:text-red-600"
                            title="Eliminar notificación"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </Card>
    )
}
