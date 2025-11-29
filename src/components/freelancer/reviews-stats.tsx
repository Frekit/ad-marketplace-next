"use client"

import { Star } from "lucide-react"
import { Card } from "@/components/ui/card"

interface ReviewsStatsProps {
    averageRating: number
    totalReviews: number
}

export default function ReviewsStats({
    averageRating,
    totalReviews,
}: ReviewsStatsProps) {
    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-5 w-5 ${star <= Math.round(rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                            }`}
                    />
                ))}
            </div>
        )
    }

    return (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="space-y-4">
                <div>
                    <p className="text-sm text-gray-600 mb-2">Calificación promedio</p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-gray-900">
                                {averageRating.toFixed(1)}
                            </span>
                            <span className="text-gray-500">/5.0</span>
                        </div>
                        {renderStars(averageRating)}
                    </div>
                </div>

                <div className="pt-2 border-t border-blue-200">
                    <p className="text-sm text-gray-600">
                        Basado en <span className="font-semibold">{totalReviews}</span> {totalReviews === 1 ? "reseña" : "reseñas"}
                    </p>
                </div>
            </div>
        </Card>
    )
}
