import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

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

        const { id: conversationId } = await params;

        if (!conversationId) {
            return NextResponse.json(
                { error: 'Conversation ID is required' },
                { status: 400 }
            );
        }

        const supabase = createClient();

        // Get conversation
        const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .select('id, project_id, participant_ids, last_message_at, created_at')
            .eq('id', conversationId)
            .single();

        if (convError || !conversation) {
            return NextResponse.json(
                { error: 'Conversation not found' },
                { status: 404 }
            );
        }

        // Verify user is a participant
        if (!conversation.participant_ids.includes(session.user.id)) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        return NextResponse.json(conversation);

    } catch (error: any) {
        console.error('Error fetching conversation:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch conversation' },
            { status: 500 }
        );
    }
}
