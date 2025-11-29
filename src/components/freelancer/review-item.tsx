"use client"

import { Star, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"

interface ReviewItemProps {
    id: string
    rating: number
    review_text: string
    created_at: string
    client_name: string
}

function getTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)

    if (diffMins < 60) {
        return `hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`
    } else if (diffHours < 24) {
        return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
    } else if (diffDays < 7) {
        return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
    } else if (diffWeeks < 4) {
        return `hace ${diffWeeks} ${diffWeeks === 1 ? 'semana' : 'semanas'}`
    } else if (diffMonths < 12) {
        return `hace ${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`
    } else {
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }
}

export default function ReviewItem({
    id,
    rating,
    review_text,
    created_at,
    client_name,
}: ReviewItemProps) {
    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                            }`}
                    />
                ))}
            </div>
        )
    }

    const timeAgo = getTimeAgo(created_at)

    return (
        <Card key={id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-semibold text-gray-900">{client_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        {renderStars(rating)}
                        <span className="text-sm text-gray-600 ml-1">{rating}.0</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {timeAgo}
                </div>
            </div>

            {review_text && (
                <p className="text-gray-700 mt-3 leading-relaxed">{review_text}</p>
            )}
        </Card>
    )
}
