"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import FreelancerLayout from "@/components/layouts/FreelancerLayout"
import ReviewsStats from "@/components/freelancer/reviews-stats"
import ReviewItem from "@/components/freelancer/review-item"
import { Card } from "@/components/ui/card"
import { Loader2, Star } from "lucide-react"

interface Review {
    id: string
    rating: number
    review_text: string
    created_at: string
    client_id: string
    client_name: string
}

interface ReviewsData {
    reviews: Review[]
    averageRating: number
    totalReviews: number
}

export default function FreelancerReviewsPage() {
    const router = useRouter()
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            router.push("/sign-in")
        },
    })

    const [data, setData] = useState<ReviewsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (session?.user?.id) {
            fetchReviews()
        }
    }, [session?.user?.id])

    const fetchReviews = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/reviews/freelancer/${session?.user?.id}`)

            if (!res.ok) {
                throw new Error("Failed to fetch reviews")
            }

            const reviewsData: ReviewsData = await res.json()
            setData(reviewsData)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar las reseñas")
            console.error("Error fetching reviews:", err)
        } finally {
            setLoading(false)
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

    return (
        <FreelancerLayout>
            <div className="p-8">
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Reseñas y calificaciones</h1>
                        <p className="text-gray-600 mt-2">
                            Ve lo que tus clientes piensan de tu trabajo
                        </p>
                    </div>

                    {/* Error State */}
                    {error && (
                        <Card className="p-4 bg-red-50 border-red-200 text-red-800">
                            {error}
                        </Card>
                    )}

                    {/* No Reviews State */}
                    {!error && data?.totalReviews === 0 ? (
                        <Card className="p-12 text-center">
                            <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Aún no tienes reseñas
                            </h2>
                            <p className="text-gray-600">
                                Tus reseñas aparecerán aquí cuando los clientes compartan sus comentarios sobre tu trabajo
                            </p>
                        </Card>
                    ) : (
                        <>
                            {/* Stats Summary */}
                            {data && (
                                <ReviewsStats
                                    averageRating={data.averageRating}
                                    totalReviews={data.totalReviews}
                                />
                            )}

                            {/* Reviews List */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    Todas las reseñas ({data?.totalReviews || 0})
                                </h2>
                                <div className="space-y-4">
                                    {data?.reviews.map((review) => (
                                        <ReviewItem key={review.id} {...review} />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </FreelancerLayout>
    )
}
