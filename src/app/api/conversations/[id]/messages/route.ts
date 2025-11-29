import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

// GET - List all messages in a conversation
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
        const supabase = createClient();

        // Verify user is a participant in this conversation
        const { data: conversation } = await supabase
            .from('conversations')
            .select('participant_ids')
            .eq('id', conversationId)
            .single();

        if (!conversation || !conversation.participant_ids.includes(session.user.id)) {
            return NextResponse.json(
                { error: 'Forbidden - Not a participant in this conversation' },
                { status: 403 }
            );
        }

        // Get messages
        const { data: messages, error } = await supabase
            .from('messages')
            .select(`
                id,
                conversation_id,
                sender_id,
                content,
                read_at,
                created_at,
                users!messages_sender_id_fkey (
                    id,
                    first_name,
                    last_name,
                    email
                )
            `)
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) {
            throw error;
        }

        return NextResponse.json({
            messages: messages || []
        });

    } catch (error: any) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

// POST - Send a new message
export async function POST(
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
        const body = await req.json();
        const { content } = body;

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { error: 'Message content is required' },
                { status: 400 }
            );
        }

        const supabase = createClient();

        // Verify user is a participant in this conversation
        const { data: conversation } = await supabase
            .from('conversations')
            .select('participant_ids')
            .eq('id', conversationId)
            .single();

        if (!conversation || !conversation.participant_ids.includes(session.user.id)) {
            return NextResponse.json(
                { error: 'Forbidden - Not a participant in this conversation' },
                { status: 403 }
            );
        }

        // Create message
        const { data: message, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: session.user.id,
                content: content.trim()
            })
            .select(`
                id,
                conversation_id,
                sender_id,
                content,
                read_at,
                created_at,
                users!messages_sender_id_fkey (
                    id,
                    first_name,
                    last_name,
                    email
                )
            `)
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            message
        });

    } catch (error: any) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send message' },
            { status: 500 }
        );
    }
}
