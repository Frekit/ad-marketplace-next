import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = createClient();

        const { data, error } = await supabase
            .from('portfolio_items')
            .select(`
                *,
                portfolio_media (
                    id,
                    media_url,
                    display_order
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!data) {
            return NextResponse.json(
                { error: 'Portfolio item not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ item: data });

    } catch (error: any) {
        console.error('Error fetching portfolio item:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch portfolio item' },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const supabase = createClient();
        const body = await req.json();

        const { title, description, client_name, project_url, year, is_featured } = body;

        // Verify ownership
        const { data: existing } = await supabase
            .from('portfolio_items')
            .select('freelancer_id')
            .eq('id', id)
            .single();

        if (!existing || existing.freelancer_id !== session.user.id) {
            return NextResponse.json(
                { error: 'Not authorized to update this item' },
                { status: 403 }
            );
        }

        // Update item
        const { data, error } = await supabase
            .from('portfolio_items')
            .update({
                title,
                description,
                client_name,
                project_url,
                year,
                is_featured,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select(`
                *,
                portfolio_media (
                    id,
                    media_url,
                    display_order
                )
            `)
            .single();

        if (error) throw error;

        return NextResponse.json({ item: data });

    } catch (error: any) {
        console.error('Error updating portfolio item:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update portfolio item' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const supabase = createClient();

        // Verify ownership
        const { data: existing } = await supabase
            .from('portfolio_items')
            .select('freelancer_id')
            .eq('id', id)
            .single();

        if (!existing || existing.freelancer_id !== session.user.id) {
            return NextResponse.json(
                { error: 'Not authorized to delete this item' },
                { status: 403 }
            );
        }

        // Delete (cascade will handle media)
        const { error } = await supabase
            .from('portfolio_items')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error deleting portfolio item:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete portfolio item' },
            { status: 500 }
        );
    }
}
