import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const supabase = createClient();

        // Get project with all details
        const { data: project, error } = await supabase
            .from('projects')
            .select(`
                *,
                client:client_id (
                    id,
                    email,
                    first_name,
                    last_name,
                    company_name
                ),
                freelancer:freelancer_id (
                    id,
                    email,
                    first_name,
                    last_name
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({ project });

    } catch (error: any) {
        console.error('Error fetching project:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch project' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await req.json();
        const supabase = createClient();

        // Update project
        const { data: project, error } = await supabase
            .from('projects')
            .update({
                ...body,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({ project });

    } catch (error: any) {
        console.error('Error updating project:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update project' },
            { status: 500 }
        );
    }
}
