import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

// GET - List all conversations for the current user
export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = createClient();

        // Get conversations where user is a participant
        const { data: conversations, error } = await supabase
            .from('conversations')
            .select(`
                id,
                project_id,
                participant_ids,
                last_message_at,
                created_at,
                messages (
                    id,
                    content,
                    sender_id,
                    created_at,
                    read_at
                )
            `)
            .contains('participant_ids', [session.user.id])
            .order('last_message_at', { ascending: false });

        if (error) {
            throw error;
        }

        // Get user details for all participants
        const allParticipantIds = new Set<string>();
        conversations?.forEach(conv => {
            conv.participant_ids.forEach((id: string) => allParticipantIds.add(id));
        });

        const { data: users } = await supabase
            .from('users')
            .select('id, first_name, last_name, email, role')
            .in('id', Array.from(allParticipantIds));

        const usersMap = new Map(users?.map(u => [u.id, u]) || []);

        // Enhance conversations with user details and last message
        const enhancedConversations = conversations?.map(conv => {
            const otherParticipantId = conv.participant_ids.find((id: string) => id !== session.user.id);
            const otherParticipant = usersMap.get(otherParticipantId || '');

            // Get last message
            const messages = Array.isArray(conv.messages) ? conv.messages : [];
            const lastMessage = messages.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];

            // Count unread messages
            const unreadCount = messages.filter(m =>
                m.sender_id !== session.user.id && !m.read_at
            ).length;

            return {
                id: conv.id,
                project_id: conv.project_id,
                other_participant: otherParticipant,
                last_message: lastMessage,
                unread_count: unreadCount,
                last_message_at: conv.last_message_at,
                created_at: conv.created_at
            };
        }) || [];

        return NextResponse.json({
            conversations: enhancedConversations
        });

    } catch (error: any) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch conversations' },
            { status: 500 }
        );
    }
}

// POST - Create or get existing conversation
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { other_user_id, project_id } = body;

        if (!other_user_id) {
            return NextResponse.json(
                { error: 'other_user_id is required' },
                { status: 400 }
            );
        }

        const supabase = createClient();

        // Use the database function to get or create conversation
        const { data, error } = await supabase.rpc('get_or_create_conversation', {
            p_user1_id: session.user.id,
            p_user2_id: other_user_id,
            p_project_id: project_id || null
        });

        if (error) {
            throw error;
        }

        // Fetch the conversation details
        const { data: conversation } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', data)
            .single();

        return NextResponse.json({
            conversation
        });

    } catch (error: any) {
        console.error('Error creating conversation:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create conversation' },
            { status: 500 }
        );
    }
}
