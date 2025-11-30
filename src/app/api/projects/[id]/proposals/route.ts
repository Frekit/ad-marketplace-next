import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';
import { notifyUser } from '@/lib/notifications';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'client') {
      return NextResponse.json(
        { error: 'Only clients can create proposals' },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;

    const body = await req.json();
    const {
      freelancer_id,
      estimated_days,
      hourly_rate,
      suggested_milestones,
      message,
    } = body;

    // Validar campos requeridos
    if (!freelancer_id || !estimated_days || !hourly_rate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 1. Verificar que el proyecto pertenece al cliente
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('client_id', session.user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or unauthorized' },
        { status: 404 }
      );
    }

    // 2. Verificar que el freelancer existe
    const { data: freelancer, error: freelancerError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('id', freelancer_id)
      .single();

    if (freelancerError || !freelancer) {
      return NextResponse.json(
        { error: 'Freelancer not found' },
        { status: 404 }
      );
    }

    // 3. Verificar que no existe propuesta previa para esta combinación
    const { data: existingInvitation } = await supabase
      .from('invitations')
      .select('id')
      .eq('project_id', projectId)
      .eq('freelancer_id', freelancer_id)
      .single();

    let invitationId: string;

    if (existingInvitation) {
      invitationId = existingInvitation.id;
    } else {
      // 4a. Crear invitation si no existe
      const { data: newInvitation, error: inviteError } = await supabase
        .from('invitations')
        .insert({
          project_id: projectId,
          freelancer_id,
          client_id: session.user.id,
          message: message || null,
          status: 'pending',
        })
        .select()
        .single();

      if (inviteError || !newInvitation) {
        return NextResponse.json(
          { error: 'Failed to create invitation' },
          { status: 500 }
        );
      }

      invitationId = newInvitation.id;
    }

    // 4b. Crear propuesta
    const total_budget = estimated_days * hourly_rate;

    const { data: proposal, error: proposalError } = await supabase
      .from('project_proposals')
      .insert({
        invitation_id: invitationId,
        project_id: projectId,
        original_estimated_days: estimated_days,
        original_hourly_rate: hourly_rate,
        original_total_budget: total_budget,
        original_suggested_milestones: suggested_milestones || [],
        message: message || null,
        status: 'sent',
        freelancer_status: 'pending',
      })
      .select()
      .single();

    if (proposalError || !proposal) {
      console.error('Error creating proposal:', proposalError);
      return NextResponse.json(
        { error: 'Failed to create proposal' },
        { status: 500 }
      );
    }

    // 5. Buscar o crear conversación automáticamente
    // Primero, buscar si ya existe una conversación entre estos dos usuarios
    const { data: existingConv, error: searchConvError } = await supabase
      .from('conversations')
      .select('id')
      .contains('participant_ids', [session.user.id, freelancer_id])
      .single();

    let conversation = null;

    if (existingConv) {
      // Usar la conversación existente
      conversation = existingConv;
    } else {
      // Crear una nueva conversación
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          participant_ids: [session.user.id, freelancer_id],
          project_id: projectId,
          proposal_id: proposal.id,
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        // No fallar aquí, la propuesta ya se creó
      } else {
        conversation = newConv;
      }
    }

    // Actualizar proposal con conversation_id si tenemos una conversación
    if (conversation) {
      await supabase
        .from('project_proposals')
        .update({ conversation_id: conversation.id })
        .eq('id', proposal.id);
    }

    // 6. Enviar notificación y email al freelancer
    const clientName =
      project.client_name ||
      `${(session.user as any).first_name || ''} ${(session.user as any).last_name || ''}`.trim() ||
      'Cliente';

    await notifyUser(
      freelancer_id,
      freelancer.email,
      'project_invitation',
      `Invitación a proyecto: ${project.title}`,
      `${clientName} te ha invitado a participar en "${project.title}"`,
      {
        freelancerName: `${freelancer.first_name} ${freelancer.last_name}`.trim(),
        companyName: clientName,
        projectTitle: project.title,
        duration: estimated_days,
        rate: hourly_rate,
        total: total_budget,
        invitationId: invitationId,
        projectId,
      }
    );

    return NextResponse.json({
      proposal_id: proposal.id,
      invitation_id: invitationId,
      conversation_id: conversation?.id,
      success: true,
    });
  } catch (error) {
    console.error('Error creating proposal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Listar propuestas de un proyecto
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'client') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;

    const supabase = createClient();

    // Verificar que el proyecto pertenece al cliente
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('client_id', session.user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Obtener todas las propuestas del proyecto
    const { data: proposals, error } = await supabase
      .from('project_proposals')
      .select(`
        id,
        invitation_id,
        project_id,
        original_estimated_days,
        original_hourly_rate,
        original_total_budget,
        original_suggested_milestones,
        final_estimated_days,
        final_hourly_rate,
        final_total_budget,
        status,
        freelancer_status,
        conversation_id,
        created_at,
        updated_at,
        project_invitations!inner(
          freelancer_id,
          client_id,
          users!invitations_freelancer_id_fkey(
            id,
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching proposals:', error);
      return NextResponse.json(
        { error: 'Failed to fetch proposals' },
        { status: 500 }
      );
    }

    // Format proposals for frontend
    const formattedProposals = proposals.map((proposal: any) => {
      const freelancer = proposal.project_invitations.users;
      return {
        id: proposal.id,
        freelancer_id: proposal.project_invitations.freelancer_id,
        freelancer: {
          first_name: freelancer.first_name,
          last_name: freelancer.last_name,
          email: freelancer.email,
        },
        duration: proposal.original_estimated_days,
        hourly_rate: proposal.original_hourly_rate,
        total_amount: proposal.original_total_budget,
        milestones: proposal.original_suggested_milestones || [],
        status: proposal.freelancer_status,
        created_at: proposal.created_at,
        conversation_id: proposal.conversation_id,
      };
    });

    return NextResponse.json({ proposals: formattedProposals });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
