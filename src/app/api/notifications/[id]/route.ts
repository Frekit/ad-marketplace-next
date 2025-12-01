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

        const { id: notificationId } = await params;
        const body = await req.json();
        const { read } = body;

        const supabase = createClient();

        // Verify notification belongs to user
        const { data: notification, error: fetchError } = await supabase
            .from('notifications')
            .select('id, user_id')
            .eq('id', notificationId)
            .single();

        // If notifications table doesn't exist, return not found
        if (fetchError?.code === 'PGRST205') {
            return NextResponse.json(
                { error: 'Notification system not yet initialized' },
                { status: 404 }
            );
        }

        if (fetchError || !notification) {
            return NextResponse.json(
                { error: 'Notification not found' },
                { status: 404 }
            );
        }

        if (notification.user_id !== session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Update notification
        const { error: updateError } = await supabase
            .from('notifications')
            .update({ read: read === true })
            .eq('id', notificationId);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({
            message: 'Notification updated successfully',
            notification_id: notificationId
        });

    } catch (error: any) {
        console.error('Error updating notification:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update notification' },
            { status: 500 }
        );
    }
}
