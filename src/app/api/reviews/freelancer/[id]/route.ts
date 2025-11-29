import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: freelancerId } = await params;

        const supabase = createClient();

        // Get reviews for freelancer
        const { data: reviews, error: reviewsError } = await supabase
            .from('reviews')
            .select(`
                id,
                rating,
                review_text,
                created_at,
                client_id,
                clients:client_id(first_name, last_name)
            `)
            .eq('freelancer_id', freelancerId)
            .order('created_at', { ascending: false });

        if (reviewsError) {
            throw reviewsError;
        }

        // Calculate average rating
        const averageRating = reviews && reviews.length > 0
            ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
            : 0;

        // Format reviews with client names
        const formattedReviews = (reviews || []).map((review: any) => ({
            id: review.id,
            rating: review.rating,
            review_text: review.review_text,
            created_at: review.created_at,
            client_id: review.client_id,
            client_name: review.clients
                ? `${review.clients.first_name || ''} ${review.clients.last_name || ''}`.trim()
                : 'Anonymous',
        }));

        return NextResponse.json({
            reviews: formattedReviews,
            averageRating: parseFloat(averageRating.toFixed(1)),
            totalReviews: reviews?.length || 0,
        });

    } catch (error: any) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch reviews' },
            { status: 500 }
        );
    }
}
