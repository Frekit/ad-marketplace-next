import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

interface UpcomingMilestone {
    id: string;
    projectId: string;
    projectTitle: string;
    milestoneName: string;
    dueDate: string;
    amount: number;
    status: string;
    daysUntilDue: number;
}

interface CalendarResponse {
    milestones: UpcomingMilestone[];
    count: number;
}

export async function GET(req: NextRequest): Promise<NextResponse<CalendarResponse | { error: string }>> {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = createClient();

        // Get all active projects for the freelancer
        const { data: projects, error: projectsError } = await supabase
            .from('freelancer_projects')
            .select(`
                id,
                project_id,
                status,
                projects (
                    id,
                    title
                )
            `)
            .eq('freelancer_id', session.user.id)
            .in('status', ['active', 'in_progress']);

        if (projectsError && projectsError.code !== 'PGRST116') {
            throw projectsError;
        }

        if (!projects || projects.length === 0) {
            return NextResponse.json({
                milestones: [],
                count: 0
            });
        }

        // Get milestones for all active projects
        const projectIds = projects.map(p => p.project_id);

        const { data: milestones, error: milestonesError } = await supabase
            .from('project_milestones')
            .select('*')
            .in('project_id', projectIds)
            .eq('status', 'pending')
            .gte('due_date', new Date().toISOString())
            .order('due_date', { ascending: true })
            .limit(10); // Show next 10 upcoming milestones

        if (milestonesError && milestonesError.code !== 'PGRST116') {
            throw milestonesError;
        }

        // Get project titles for the milestones
        const projectMap = new Map(
            projects.map(p => [p.project_id, p.projects?.title || 'Unknown Project'])
        );

        // Transform and format the data
        const now = new Date();
        const upcomingMilestones: UpcomingMilestone[] = (milestones || []).map(milestone => {
            const dueDate = new Date(milestone.due_date);
            const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            return {
                id: milestone.id,
                projectId: milestone.project_id,
                projectTitle: projectMap.get(milestone.project_id) || 'Unknown Project',
                milestoneName: milestone.name,
                dueDate: milestone.due_date,
                amount: milestone.amount || 0,
                status: milestone.status,
                daysUntilDue
            };
        });

        return NextResponse.json({
            milestones: upcomingMilestones,
            count: upcomingMilestones.length
        });

    } catch (error: any) {
        console.error('Error fetching upcoming milestones:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch upcoming milestones' },
            { status: 500 }
        );
    }
}
