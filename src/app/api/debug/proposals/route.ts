import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const supabase = createClient();

        // Get the freelancer_id from query params
        const freelancerId = req.nextUrl.searchParams.get('freelancer_id');

        if (!freelancerId) {
            return NextResponse.json({
                error: 'Missing freelancer_id parameter'
            }, { status: 400 });
        }

        // Fetch project invitations for this freelancer with relationships
        const { data: invitations, error } = await supabase
            .from('invitations')
            .select(`
                id,
                status,
                created_at,
                message,
                project:projects (
                    id,
                    title,
                    description,
                    skills_required,
                    allocated_budget,
                    created_at
                ),
                client:users!invitations_client_id_fkey (
                    id,
                    first_name,
                    last_name,
                    email,
                    company_name
                )
            `)
            .eq('freelancer_id', freelancerId)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({
                error: 'Database error',
                details: error.message,
                code: error.code
            }, { status: 500 });
        }

        // Format the response
        const proposals = invitations?.map(inv => {
            const clientData = Array.isArray(inv.client) ? inv.client[0] : inv.client;
            const clientName = clientData?.company_name ||
                             `${clientData?.first_name || ''} ${clientData?.last_name || ''}`.trim() ||
                             'Cliente';
            return {
                id: inv.id,
                project: inv.project,
                client: {
                    name: clientName,
                    email: clientData?.email || '',
                },
                message: inv.message,
                status: inv.status,
                created_at: inv.created_at,
            };
        }) || [];

        return NextResponse.json({
            freelancer_id: freelancerId,
            proposal_count: proposals.length,
            proposals: proposals,
            message: 'Debug endpoint - temporary only'
        });

    } catch (error: any) {
        return NextResponse.json({
            error: error.message
        }, { status: 500 });
    }
}
