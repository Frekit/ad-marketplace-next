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

        // Fetch project invitations for this freelancer
        const { data: invitations, error } = await supabase
            .from('project_invitations')
            .select(`
                id,
                status,
                created_at,
                project:projects (
                    id,
                    title,
                    description,
                    skills_required,
                    created_at
                ),
                client:users!project_invitations_client_id_fkey (
                    id,
                    name,
                    email
                )
            `)
            .eq('freelancer_id', session.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // Format the response
        const proposals = invitations?.map(inv => {
            const clientData = Array.isArray(inv.client) ? inv.client[0] : inv.client;
            return {
                id: inv.id,
                project: inv.project,
                client: {
                    name: clientData?.name || 'Cliente',
                    company: clientData?.email || '',
                },
                status: inv.status,
                created_at: inv.created_at,
            };
        }) || [];

        return NextResponse.json({ proposals });

    } catch (error: any) {
        console.error('Error fetching proposals:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch proposals' },
            { status: 500 }
        );
    }
}
