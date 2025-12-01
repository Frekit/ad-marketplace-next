import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

interface ActiveProject {
    id: string;
    projectId: string;
    projectTitle: string;
    projectDescription: string;
    status: string;
    budget: number;
    startDate: string | null;
    dueDate: string | null;
    completedMilestones: number;
    totalMilestones: number;
}

interface ActiveProjectsResponse {
    projects: ActiveProject[];
    count: number;
}

export async function GET(req: NextRequest): Promise<NextResponse<ActiveProjectsResponse | { error: string }>> {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = createClient();

        // Get all active/in-progress projects for the freelancer
        const { data: freelancerProjects, error: projectsError } = await supabase
            .from('freelancer_projects')
            .select(`
                id,
                project_id,
                status,
                projects (
                    id,
                    title,
                    description,
                    budget
                )
            `)
            .eq('freelancer_id', session.user.id)
            .in('status', ['active', 'in_progress', 'ongoing']);

        if (projectsError && projectsError.code !== 'PGRST116') {
            throw projectsError;
        }

        if (!freelancerProjects || freelancerProjects.length === 0) {
            return NextResponse.json({
                projects: [],
                count: 0
            });
        }

        // Get milestone completion data for each project
        const projectIds = freelancerProjects.map(p => p.project_id);

        const { data: milestones, error: milestonesError } = await supabase
            .from('project_milestones')
            .select('project_id, status')
            .in('project_id', projectIds);

        if (milestonesError && milestonesError.code !== 'PGRST116') {
            throw milestonesError;
        }

        // Build milestone count map
        const milestoneMap = new Map<string, { completed: number; total: number }>();

        projectIds.forEach(id => {
            milestoneMap.set(id, { completed: 0, total: 0 });
        });

        (milestones || []).forEach(m => {
            const data = milestoneMap.get(m.project_id);
            if (data) {
                data.total++;
                if (m.status === 'completed') {
                    data.completed++;
                }
            }
        });

        // Transform and format the data
        const activeProjects: ActiveProject[] = freelancerProjects.map((fp: any) => {
            const milestone = milestoneMap.get(fp.project_id) || { completed: 0, total: 0 };
            return {
                id: fp.id,
                projectId: fp.project_id,
                projectTitle: fp.projects?.title || 'Unknown Project',
                projectDescription: fp.projects?.description || '',
                status: fp.status,
                budget: fp.projects?.budget || 0,
                startDate: null, // Would need to fetch from project details
                dueDate: null,   // Would need to fetch from project details
                completedMilestones: milestone.completed,
                totalMilestones: milestone.total
            };
        });

        return NextResponse.json({
            projects: activeProjects,
            count: activeProjects.length
        });

    } catch (error: any) {
        console.error('Error fetching active projects:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch active projects' },
            { status: 500 }
        );
    }
}
