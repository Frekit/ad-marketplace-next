import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: projectId } = await params;
        const supabase = createClient();

        // Fetch project
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('id, title, description, status, allocated_budget, spent_amount, skills_required, client_id, freelancer_id, created_at, updated_at')
            .eq('id', projectId)
            .single();

        if (projectError) {
            console.error('Supabase error:', projectError);
            return NextResponse.json(
                { error: 'Project not found: ' + projectError.message },
                { status: 404 }
            );
        }

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Verify access (must be the client who created it)
        if (project.client_id !== session.user.id) {
            return NextResponse.json(
                { error: 'Access denied - you are not the project owner' },
                { status: 403 }
            );
        }

        // If project has a freelancer, fetch their details
        let freelancer = null;
        if (project.freelancer_id) {
            const { data: freelancerData, error: freelancerError } = await supabase
                .from('users')
                .select('id, email')
                .eq('id', project.freelancer_id)
                .single();
            
            if (freelancerData) {
                freelancer = freelancerData;
            } else if (freelancerError) {
                console.error('Error fetching freelancer:', freelancerError);
            }
        }

        // Build response with freelancer data
        const response = {
            ...project,
            freelancer
        };

        return NextResponse.json({ project: response });

    } catch (error: any) {
        console.error('Error fetching project:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch project' },
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

        if (!session?.user || session.user.role !== 'client') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: projectId } = await params;
        const { title, description, skills_required, allocated_budget } = await req.json();

        const supabase = createClient();

        // Verify ownership
        const { data: project } = await supabase
            .from('projects')
            .select('client_id')
            .eq('id', projectId)
            .single();

        if (!project || project.client_id !== session.user.id) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        // Update project
        const { data: updated, error } = await supabase
            .from('projects')
            .update({
                title,
                description,
                skills_required,
                allocated_budget,
                updated_at: new Date().toISOString(),
            })
            .eq('id', projectId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            message: 'Project updated successfully',
            project: updated,
        });

    } catch (error: any) {
        console.error('Error updating project:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update project' },
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

        if (!session?.user || session.user.role !== 'client') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: projectId } = await params;
        const supabase = createClient();

        // Verify ownership
        const { data: project } = await supabase
            .from('projects')
            .select('client_id')
            .eq('id', projectId)
            .single();

        if (!project || project.client_id !== session.user.id) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        // Delete project
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId);

        if (error) {
            throw error;
        }

        return NextResponse.json({
            message: 'Project deleted successfully',
        });

    } catch (error: any) {
        console.error('Error deleting project:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete project' },
            { status: 500 }
        );
    }
}
