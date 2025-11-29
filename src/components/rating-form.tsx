"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star } from "lucide-react"

interface RatingFormProps {
    freelancerId: string
    projectId: string
    onSubmit?: (rating: number, review: string) => Promise<void>
}

export function RatingForm({ freelancerId, projectId, onSubmit }: RatingFormProps) {
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [review, setReview] = useState("")
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async () => {
        if (rating === 0) {
            alert("Please select a rating")
            return
        }

        setLoading(true)
        try {
            if (onSubmit) {
                await onSubmit(rating, review)
            } else {
                // Default API call
                const res = await fetch("/api/reviews/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        freelancer_id: freelancerId,
                        project_id: projectId,
                        rating,
                        review_text: review,
                    }),
                })

                const data = await res.json()
                if (!res.ok) {
                    throw new Error(data.error || "Failed to submit review")
                }
            }

            setSubmitted(true)
            setRating(0)
            setReview("")
        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                    <p className="text-center text-green-700 font-medium">
                        Thank you for your review!
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Rate This Freelancer</CardTitle>
                <CardDescription>
                    Share your experience working with this freelancer
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Star Rating */}
                <div className="space-y-2">
                    <Label>Rating</Label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`h-8 w-8 ${
                                        star <= (hoveredRating || rating)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                    {rating > 0 && (
                        <p className="text-sm text-muted-foreground">
                            {rating === 1 && "Poor"}
                            {rating === 2 && "Fair"}
                            {rating === 3 && "Good"}
                            {rating === 4 && "Very Good"}
                            {rating === 5 && "Excellent"}
                        </p>
                    )}
                </div>

                {/* Review Text */}
                <div className="space-y-2">
                    <Label htmlFor="review">Review (Optional)</Label>
                    <Textarea
                        id="review"
                        placeholder="Share your experience with this freelancer..."
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        rows={4}
                        disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                        {review.length}/500 characters
                    </p>
                </div>

                {/* Submit Button */}
                <Button
                    onClick={handleSubmit}
                    disabled={loading || rating === 0}
                    className="w-full bg-[#FF5C5C] hover:bg-[#FF5C5C]/90"
                >
                    {loading ? "Submitting..." : "Submit Review"}
                </Button>
            </CardContent>
        </Card>
    )
}
