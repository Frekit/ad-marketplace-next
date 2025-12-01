import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

interface ActiveProject {
    id: string;
    title: string;
    description: string;
    status: string;
    budget: number;
    proposalsReceived: number;
    postedDate: string;
    deadline: string | null;
}

interface ActiveProjectsResponse {
    projects: ActiveProject[];
    count: number;
}

export async function GET(req: NextRequest): Promise<NextResponse<ActiveProjectsResponse | { error: string }>> {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'client') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = createClient();

        // Get active projects for the client
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('*')
            .eq('client_id', session.user.id)
            .in('status', ['active', 'open'])
            .order('created_at', { ascending: false });

        if (projectsError && projectsError.code !== 'PGRST116') {
            throw projectsError;
        }

        // For each project, count proposals
        const projectsWithCounts = await Promise.all(
            (projects || []).map(async (project) => {
                const { count: proposalCount } = await supabase
                    .from('invitations')
                    .select('*', { count: 'exact', head: true })
                    .eq('project_id', project.id)
                    .in('status', ['pending', 'offer_submitted']);

                return {
                    id: project.id,
                    title: project.title,
                    description: project.description,
                    status: project.status,
                    budget: project.budget || 0,
                    proposalsReceived: proposalCount || 0,
                    postedDate: project.created_at,
                    deadline: project.deadline || null
                };
            })
        );

        return NextResponse.json({
            projects: projectsWithCounts,
            count: projectsWithCounts.length
        });

    } catch (error: any) {
        console.error('Error fetching active projects:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch active projects' },
            { status: 500 }
        );
    }
}
