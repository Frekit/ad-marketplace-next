import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';
import { notifyUser } from '@/lib/notifications';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'client') {
            return NextResponse.json(
                { error: 'Unauthorized. Only clients can leave reviews.' },
                { status: 401 }
            );
        }

        const { freelancer_id, project_id, rating, review_text } = await req.json();

        // Validate input
        if (!freelancer_id || !rating) {
            return NextResponse.json(
                { error: 'Freelancer ID and rating are required' },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        const supabase = createClient();

        // Check if review already exists for this project
        const { data: existingReview } = await supabase
            .from('reviews')
            .select('id')
            .eq('freelancer_id', freelancer_id)
            .eq('project_id', project_id)
            .eq('client_id', session.user.id)
            .single();

        if (existingReview) {
            return NextResponse.json(
                { error: 'You have already reviewed this freelancer for this project' },
                { status: 400 }
            );
        }

        // Create review
        const { data: review, error: createError } = await supabase
            .from('reviews')
            .insert({
                freelancer_id,
                project_id: project_id || null,
                client_id: session.user.id,
                rating,
                review_text: review_text || '',
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (createError) {
            throw createError;
        }

        // Get freelancer info for notification
        const { data: freelancer, error: freelancerError } = await supabase
            .from('users')
            .select('id, email')
            .eq('id', freelancer_id)
            .single();

        if (freelancer && freelancer.email) {
            await notifyUser(
                freelancer.id,
                freelancer.email,
                'payment_received',
                'You Received a New Review',
                `A client left you a ${rating}-star review on their project.`,
                { rating, reviewId: review.id, project_id }
            );
        }

        return NextResponse.json({
            message: 'Review submitted successfully',
            reviewId: review.id,
        });

    } catch (error: any) {
        console.error('Error creating review:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create review' },
            { status: 500 }
        );
    }
}
