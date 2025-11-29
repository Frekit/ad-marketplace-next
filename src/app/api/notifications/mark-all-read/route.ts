import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = createClient();

        // Mark all unread notifications as read
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', session.user.id)
            .eq('read', false);

        if (error) {
            throw error;
        }

        return NextResponse.json({
            message: 'All notifications marked as read'
        });

    } catch (error: any) {
        console.error('Error marking notifications as read:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to mark notifications as read' },
            { status: 500 }
        );
    }
}
