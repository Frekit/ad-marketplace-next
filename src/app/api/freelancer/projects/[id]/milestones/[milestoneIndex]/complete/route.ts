import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; milestoneIndex: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: projectId, milestoneIndex } = await params;
        const milestoneIdx = parseInt(milestoneIndex);
        const supabase = createClient();

        // Get project details
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .eq('freelancer_id', session.user.id)
            .single();

        if (projectError || !project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        const milestones = project.milestones || [];
        if (milestoneIdx >= milestones.length) {
            return NextResponse.json(
                { error: 'Milestone not found' },
                { status: 404 }
            );
        }

        const milestone = milestones[milestoneIdx];

        if (milestone.status !== 'pending') {
            return NextResponse.json(
                { error: 'Milestone is not in pending status' },
                { status: 400 }
            );
        }

        // Update milestone status to completed
        milestones[milestoneIdx].status = 'completed';
        const { error: updateError } = await supabase
            .from('projects')
            .update({ milestones })
            .eq('id', projectId);

        if (updateError) {
            throw updateError;
        }

        // TODO: Send notification to client

        return NextResponse.json({
            message: 'Milestone marked as completed',
        });

    } catch (error: any) {
        console.error('Error completing milestone:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to complete milestone' },
            { status: 500 }
        );
    }
}
