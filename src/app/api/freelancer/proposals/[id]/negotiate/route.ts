import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function POST(
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

        const { id: invitationId } = await params;
        const supabase = createClient();

        // Get the invitation
        const { data: invitation, error: invError } = await supabase
            .from('project_invitations')
            .select('id, project_id, freelancer_id, client_id')
            .eq('id', invitationId)
            .eq('freelancer_id', session.user.id)
            .single();

        if (invError || !invitation) {
            return NextResponse.json(
                { error: 'Invitation not found' },
                { status: 404 }
            );
        }

        // Check if there's already a proposal with a conversation
        const { data: proposal } = await supabase
            .from('project_proposals')
            .select('id, conversation_id')
            .eq('invitation_id', invitationId)
            .single();

        // If proposal exists and has a conversation, return it
        if (proposal && proposal.conversation_id) {
            return NextResponse.json({
                conversation_id: proposal.conversation_id,
                message: 'Using existing conversation'
            });
        }

        // Check if conversation already exists between these users for this project
        const { data: existingConv } = await supabase
            .from('conversations')
            .select('id')
            .contains('participant_ids', [session.user.id, invitation.client_id])
            .eq('project_id', invitation.project_id)
            .single();

        let conversation_id = existingConv?.id;

        // If no conversation exists, create one
        if (!conversation_id) {
            const { data: newConv, error: convError } = await supabase
                .from('conversations')
                .insert({
                    participant_ids: [session.user.id, invitation.client_id],
                    project_id: invitation.project_id,
                    last_message_at: new Date().toISOString(),
                })
                .select('id')
                .single();

            if (convError || !newConv) {
                return NextResponse.json(
                    { error: 'Failed to create conversation' },
                    { status: 500 }
                );
            }

            conversation_id = newConv.id;

            // If there's a proposal, update it with the conversation_id
            if (proposal) {
                await supabase
                    .from('project_proposals')
                    .update({ conversation_id: newConv.id })
                    .eq('id', proposal.id);
            }
        }

        return NextResponse.json({
            conversation_id,
            message: 'Conversation created/retrieved successfully'
        });

    } catch (error: any) {
        console.error('Error negotiating proposal:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to negotiate proposal' },
            { status: 500 }
        );
    }
}
