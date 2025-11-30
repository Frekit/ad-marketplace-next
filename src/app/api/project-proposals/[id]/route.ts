import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: proposalId } = await params;

    const body = await req.json();
    const {
      final_estimated_days,
      final_hourly_rate,
      negotiation_entry,
      status,
      freelancer_status,
    } = body;

    const supabase = createClient();

    // Obtener propuesta actual
    const { data: proposal, error: fetchError } = await supabase
      .from('project_proposals')
      .select(`
        *,
        project_invitations!inner(
          freelancer_id,
          client_id
        )
      `)
      .eq('id', proposalId)
      .single();

    if (fetchError || !proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    // Verificar que el usuario es empresa o el freelancer involucrado
    const isClient = proposal.project_invitations.client_id === session.user.id;
    const isFreelancer =
      proposal.project_invitations.freelancer_id === session.user.id;

    if (!isClient && !isFreelancer) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Construir historial de negociación
    let updatedHistory = proposal.negotiation_history || [];
    if (negotiation_entry) {
      updatedHistory.push({
        ...negotiation_entry,
        timestamp: new Date().toISOString(),
        actor: isClient ? 'company' : 'freelancer',
      });
    }

    // Calcular total si hay cambios en términos finales
    let final_total_budget = proposal.final_total_budget;
    if (final_estimated_days && final_hourly_rate) {
      final_total_budget = final_estimated_days * final_hourly_rate;
    }

    // Actualizar propuesta
    const { data: updated, error: updateError } = await supabase
      .from('project_proposals')
      .update({
        final_estimated_days:
          final_estimated_days ?? proposal.final_estimated_days,
        final_hourly_rate: final_hourly_rate ?? proposal.final_hourly_rate,
        final_total_budget,
        negotiation_history: updatedHistory,
        status: status ?? proposal.status,
        freelancer_status: freelancer_status ?? proposal.freelancer_status,
      })
      .eq('id', proposalId)
      .select()
      .single();

    if (updateError || !updated) {
      console.error('Error updating proposal:', updateError);
      return NextResponse.json(
        { error: 'Failed to update proposal' },
        { status: 500 }
      );
    }

    return NextResponse.json({ proposal: updated });
  } catch (error) {
    console.error('Error updating proposal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Obtener detalles de una propuesta
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: proposalId } = await params;

    const supabase = createClient();

    const { data: proposal, error } = await supabase
      .from('project_proposals')
      .select(`
        *,
        project_invitations!inner(
          freelancer_id,
          client_id
        ),
        projects(
          id,
          title,
          description,
          skills_required,
          allocated_budget
        ),
        conversations(
          id
        )
      `)
      .eq('id', proposalId)
      .single();

    if (error || !proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    // Verificar acceso
    const isClient = proposal.project_invitations.client_id === session.user.id;
    const isFreelancer =
      proposal.project_invitations.freelancer_id === session.user.id;

    if (!isClient && !isFreelancer) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({ proposal });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
