import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const supabase = createClient();

        // Get user details first
        const { data: user } = await supabase
            .from('users')
            .select('email, first_name, last_name')
            .eq('id', id)
            .single();

        // Update verification status to approved
        const { error } = await supabase
            .from('users')
            .update({
                verification_status: 'approved',
                verification_notes: `Approved by ${session.user.email} on ${new Date().toISOString()}`,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            throw error;
        }

        // TODO: Send approval email to freelancer
        // For now, log it
        if (user) {
            console.log(`✅ Verification approved for ${user.email} (${user.first_name} ${user.last_name})`);
            console.log(`📧 Email notification should be sent to: ${user.email}`);
            console.log(`🔔 In-app notification should be created`);
        }

        return NextResponse.json({
            message: 'Verification approved successfully',
            user: user
        });

    } catch (error: any) {
        console.error('Error approving verification:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to approve verification' },
            { status: 500 }
        );
    }
}
