import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'freelancer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: proposalId } = await params;

    if (!proposalId) {
      return NextResponse.json(
        { error: 'Invalid proposal ID' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get the project_proposals record for this freelancer
    const { data: proposal, error: proposalError } = await supabase
      .from('project_proposals')
      .select(`
        id,
        original_estimated_days,
        original_hourly_rate,
        original_total_budget,
        original_suggested_milestones,
        status,
        created_at,
        conversation_id,
        project_id,
        invitation_id,
        project_invitations!inner(
          freelancer_id,
          client_id
        ),
        projects (
          id,
          title,
          description,
          skills_required
        ),
        users!project_invitations_client_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', proposalId)
      .eq('freelancer_id', session.user.id)
      .single();

    if (proposalError || !proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    // Get client data from the project_invitations relationship
    const invitationData = proposal.project_invitations[0] || {};

    // Get client details from users table
    const clientData = Array.isArray(proposal.users) ? proposal.users[0] : proposal.users;

    // Construct response
    const responseData = {
      id: proposal.id,
      proposal: {
        id: proposal.id,
        project_id: proposal.project_id,
        freelancer_id: invitationData.freelancer_id,
        client_id: invitationData.client_id,
        duration: proposal.original_estimated_days,
        hourly_rate: proposal.original_hourly_rate,
        total_amount: proposal.original_total_budget,
        status: proposal.status,
        milestones: proposal.original_suggested_milestones || [],
        created_at: proposal.created_at,
        conversation_id: proposal.conversation_id
      },
      project: proposal.projects || {
        id: proposal.project_id,
        title: 'Sin título',
        description: '',
        skills_required: []
      },
      client: {
        id: clientData?.id,
        first_name: clientData?.first_name || '',
        last_name: clientData?.last_name || '',
        email: clientData?.email || ''
      }
    };

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Error fetching freelancer proposal:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch proposal' },
      { status: 500 }
    );
  }
}
