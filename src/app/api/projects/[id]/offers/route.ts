import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'client') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: projectId } = await params;
        const supabase = createClient();

        // Verify project ownership
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .eq('client_id', session.user.id)
            .single();

        if (projectError || !project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Fetch offers for this project
        const { data: offers, error: offersError } = await supabase
            .from('freelancer_offers')
            .select(`
                id,
                cover_letter,
                milestones,
                total_amount,
                status,
                created_at,
                freelancer:users!freelancer_offers_freelancer_id_fkey (
                    id,
                    name,
                    email
                )
            `)
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (offersError) {
            throw offersError;
        }

        return NextResponse.json({
            project,
            offers: offers || [],
        });

    } catch (error: any) {
        console.error('Error fetching project offers:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch offers' },
            { status: 500 }
        );
    }
}
