import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const supabase = createClient();
        const { searchParams } = new URL(req.url);

        const freelancerId = searchParams.get('freelancer_id');
        const featured = searchParams.get('featured');

        let query = supabase
            .from('portfolio_items')
            .select(`
                *,
                portfolio_media (
                    id,
                    media_url,
                    display_order
                )
            `)
            .order('created_at', { ascending: false });

        if (freelancerId) {
            query = query.eq('freelancer_id', freelancerId);
        }

        if (featured === 'true') {
            query = query.eq('is_featured', true);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json({ items: data });

    } catch (error: any) {
        console.error('Error fetching portfolio:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch portfolio' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Only freelancers can create portfolio items' },
                { status: 401 }
            );
        }

        const supabase = createClient();
        const body = await req.json();

        const { title, description, client_name, project_url, year, media_urls } = body;

        // Validate max 3 images
        if (media_urls && media_urls.length > 3) {
            return NextResponse.json(
                { error: 'Maximum 3 images allowed in MVP' },
                { status: 400 }
            );
        }

        // Create portfolio item
        const { data: portfolioItem, error: itemError } = await supabase
            .from('portfolio_items')
            .insert({
                freelancer_id: session.user.id,
                title,
                description,
                client_name,
                project_url,
                year
            })
            .select()
            .single();

        if (itemError) throw itemError;

        // Add media if provided
        if (media_urls && media_urls.length > 0) {
            const mediaInserts = media_urls.map((url: string, index: number) => ({
                portfolio_item_id: portfolioItem.id,
                media_url: url,
                display_order: index
            }));

            const { error: mediaError } = await supabase
                .from('portfolio_media')
                .insert(mediaInserts);

            if (mediaError) throw mediaError;
        }

        // Fetch complete item with media
        const { data: completeItem } = await supabase
            .from('portfolio_items')
            .select(`
                *,
                portfolio_media (
                    id,
                    media_url,
                    display_order
                )
            `)
            .eq('id', portfolioItem.id)
            .single();

        return NextResponse.json({ item: completeItem }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating portfolio item:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create portfolio item' },
            { status: 500 }
        );
    }
}
