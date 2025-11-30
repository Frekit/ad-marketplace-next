import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized. Only freelancers can view proposals.' },
                { status: 401 }
            );
        }

        const supabase = createClient();

        // Get 30 days ago date
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

        // Fetch project proposals for this freelancer
        const { data: proposals, error } = await supabase
            .from('project_proposals')
            .select(`
                id,
                status,
                created_at,
                project_invitations!inner(
                    freelancer_id
                ),
                projects (
                    id,
                    title,
                    description,
                    skills_required,
                    allocated_budget,
                    created_at
                ),
                users!project_invitations_client_id_fkey (
                    id,
                    first_name,
                    last_name,
                    email,
                    company_name
                )
            `)
            .eq('project_invitations.freelancer_id', session.user.id)
            .gte('created_at', thirtyDaysAgoISO)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Database error:', error);
            throw error;
        }

        // Format the response
        const formattedProposals = proposals?.map((prop: any) => {
            const clientData = Array.isArray(prop.users) ? prop.users[0] : prop.users;
            const clientName = clientData?.company_name ||
                             `${clientData?.first_name || ''} ${clientData?.last_name || ''}`.trim() ||
                             'Cliente';
            return {
                id: prop.id,
                project: prop.projects,
                client: {
                    name: clientName,
                    email: clientData?.email || '',
                },
                status: prop.status,
                created_at: prop.created_at,
            };
        }) || [];

        return NextResponse.json({ proposals: formattedProposals });

    } catch (error: any) {
        console.error('Error fetching proposals:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch proposals' },
            { status: 500 }
        );
    }
}
