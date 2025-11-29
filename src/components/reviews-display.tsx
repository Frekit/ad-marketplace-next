"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import { useEffect, useState } from "react"

interface Review {
    id: string
    client_id: string
    client_name?: string
    rating: number
    review_text: string
    created_at: string
}

interface ReviewsDisplayProps {
    freelancerId: string
}

export function ReviewsDisplay({ freelancerId }: ReviewsDisplayProps) {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [averageRating, setAverageRating] = useState(0)

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch(`/api/reviews/freelancer/${freelancerId}`)
                if (res.ok) {
                    const data = await res.json()
                    setReviews(data.reviews || [])
                    setAverageRating(data.averageRating || 0)
                }
            } catch (error) {
                console.error("Error fetching reviews:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchReviews()
    }, [freelancerId])

    if (loading) {
        return <div className="text-center py-8">Loading reviews...</div>
    }

    if (reviews.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    <p>No reviews yet</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Average Rating */}
            <Card>
                <CardHeader>
                    <CardTitle>Reviews ({reviews.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-5 w-5 ${
                                                star <= Math.round(averageRating)
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Individual Reviews */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <Card key={review.id}>
                        <CardContent className="pt-6">
                            <div className="space-y-3">
                                {/* Reviewer Info */}
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>
                                            {review.client_name?.charAt(0) || "C"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{review.client_name || "Anonymous"}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-4 w-4 ${
                                                star <= review.rating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300"
                                            }`}
                                        />
                                    ))}
                                </div>

                                {/* Review Text */}
                                {review.review_text && (
                                    <p className="text-sm text-gray-700">{review.review_text}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
