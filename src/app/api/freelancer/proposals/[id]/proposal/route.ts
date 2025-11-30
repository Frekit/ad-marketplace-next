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

    // Get freelancer's verification status and rate
    const { data: freelancerData, error: freelancerError } = await supabase
      .from('users')
      .select('verification_status, daily_rate')
      .eq('id', session.user.id)
      .single();

    if (freelancerError) {
      console.error('Error fetching freelancer verification status:', freelancerError);
    }

    // Get the invitation for this freelancer (which may or may not have a proposal yet)
    const { data: invitation, error: invitationError } = await supabase
      .from('project_invitations')
      .select(`
        id,
        status,
        message,
        created_at,
        project_id,
        freelancer_id,
        client_id,
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

    // If there's a proposal, get its details
    let proposalDetails = null;
    if (invitation && invitation.project_id) {
      const { data: proposal } = await supabase
        .from('project_proposals')
        .select(`
          id,
          original_estimated_days,
          original_hourly_rate,
          original_total_budget,
          original_suggested_milestones,
          status,
          conversation_id,
          created_at
        `)
        .eq('invitation_id', invitation.id)
        .single();

      proposalDetails = proposal;
    }

    const proposal = invitation;
    const proposalError = invitationError;

    if (proposalError || !proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    // Get client details from users table
    const clientData = Array.isArray(proposal.users) ? proposal.users[0] : proposal.users;

    // Calculate price per day and percentage difference
    const pricePerDay = proposalDetails?.original_total_budget && proposalDetails?.original_estimated_days
      ? proposalDetails.original_total_budget / proposalDetails.original_estimated_days
      : null;

    const freelancerDailyRate = freelancerData?.daily_rate || 0;
    const priceDifference = pricePerDay && freelancerDailyRate
      ? ((pricePerDay - freelancerDailyRate) / freelancerDailyRate) * 100
      : null;

    // Construct response
    const responseData = {
      id: proposal.id,
      verification_status: freelancerData?.verification_status || 'pending',
      freelancer_daily_rate: freelancerDailyRate,
      proposal: {
        id: proposalDetails?.id || proposal.id,
        project_id: proposal.project_id,
        freelancer_id: proposal.freelancer_id,
        client_id: proposal.client_id,
        duration: proposalDetails?.original_estimated_days || null,
        hourly_rate: proposalDetails?.original_hourly_rate || null,
        total_amount: proposalDetails?.original_total_budget || 0,
        price_per_day: pricePerDay,
        price_difference_percent: priceDifference,
        status: proposalDetails?.status || proposal.status,
        milestones: proposalDetails?.original_suggested_milestones || [],
        created_at: proposalDetails?.created_at || proposal.created_at,
        conversation_id: proposalDetails?.conversation_id || null,
        has_proposal: !!proposalDetails
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
