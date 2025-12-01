import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

interface RecommendedFreelancer {
    id: string;
    name: string;
    skills: string[];
    hourlyRate: number;
    availability: string;
    rating: number;
    totalReviews: number;
    completedProjects: number;
}

interface RecommendedFreelancersResponse {
    freelancers: RecommendedFreelancer[];
    reason: string;
}

export async function GET(req: NextRequest): Promise<NextResponse<RecommendedFreelancersResponse | { error: string }>> {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'client') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = createClient();

        // Get the client's recent projects to extract skills
        const { data: clientProjects, error: projectsError } = await supabase
            .from('projects')
            .select('skills_required')
            .eq('client_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(5);

        if (projectsError && projectsError.code !== 'PGRST116') {
            throw projectsError;
        }

        // Extract unique skills from recent projects
        const skillsSet = new Set<string>();
        (clientProjects || []).forEach(project => {
            if (project.skills_required && Array.isArray(project.skills_required)) {
                project.skills_required.forEach(skill => skillsSet.add(skill));
            }
        });

        const requiredSkills = Array.from(skillsSet).slice(0, 5); // Top 5 skills

        // If client has no projects, return empty list
        if (requiredSkills.length === 0) {
            return NextResponse.json({
                freelancers: [],
                reason: 'No skills to match - create a project first'
            });
        }

        // Find freelancers with matching skills
        // Order by: rating (desc), completed projects (desc), hourly rate (asc)
        const { data: freelancers, error: freelancersError } = await supabase
            .rpc('get_recommended_freelancers', {
                p_skills: requiredSkills,
                p_limit: 5
            });

        if (freelancersError) {
            // Fallback to direct query if RPC doesn't exist
            return await fallbackFreelancerQuery(supabase, requiredSkills, session.user.id);
        }

        const recommendedFreelancers: RecommendedFreelancer[] = (freelancers || []).map((f: any) => ({
            id: f.freelancer_id,
            name: f.freelancer_name,
            skills: f.skills || [],
            hourlyRate: f.hourly_rate || 0,
            availability: f.availability || 'available',
            rating: f.avg_rating || 0,
            totalReviews: f.review_count || 0,
            completedProjects: f.completed_projects || 0
        }));

        return NextResponse.json({
            freelancers: recommendedFreelancers,
            reason: `Matched ${requiredSkills.join(', ')}`
        });

    } catch (error: any) {
        console.error('Error fetching recommended freelancers:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch recommended freelancers' },
            { status: 500 }
        );
    }
}

async function fallbackFreelancerQuery(supabase: any, skills: string[], clientId: string) {
    try {
        // Get freelancers with matching skills
        const { data: freelancers, error } = await supabase
            .from('freelancer_profiles')
            .select(`
                user_id,
                hourly_rate,
                skills,
                availability,
                users (
                    id,
                    first_name,
                    last_name
                )
            `)
            .eq('verification_status', 'approved')
            .in('availability', ['available', 'semi-available']);

        if (error) throw error;

        // Filter by matching skills and calculate ratings
        const filteredFreelancers = (freelancers || [])
            .filter((f: any) => {
                const freelancerSkills = f.skills || [];
                return skills.some(s => freelancerSkills.includes(s));
            })
            .map((f: any) => ({
                freelancer_id: f.user_id,
                freelancer_name: `${f.users?.first_name || ''} ${f.users?.last_name || ''}`.trim(),
                skills: f.skills || [],
                hourly_rate: f.hourly_rate || 0,
                availability: f.availability || 'available',
                avg_rating: 0,
                review_count: 0,
                completed_projects: 0
            }))
            .slice(0, 5);

        const recommendedFreelancers: RecommendedFreelancer[] = filteredFreelancers.map((f: any) => ({
            id: f.freelancer_id,
            name: f.freelancer_name,
            skills: f.skills,
            hourlyRate: f.hourly_rate,
            availability: f.availability,
            rating: f.avg_rating,
            totalReviews: f.review_count,
            completedProjects: f.completed_projects
        }));

        return NextResponse.json({
            freelancers: recommendedFreelancers,
            reason: `Matched with ${filteredFreelancers[0]?.skills?.slice(0, 2)?.join(', ') || 'relevant skills'}`
        });

    } catch (error: any) {
        console.error('Error in fallback freelancer query:', error);
        return NextResponse.json({
            freelancers: [],
            reason: 'Unable to fetch recommendations'
        });
    }
}
