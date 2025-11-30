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
        const body = await req.json();
        const { reason } = body;

        if (!reason) {
            return NextResponse.json(
                { error: 'Rejection reason is required' },
                { status: 400 }
            );
        }

        const supabase = createClient();

        // Update verification status to rejected
        const { error } = await supabase
            .from('users')
            .update({
                verification_status: 'rejected',
                verification_notes: `Rejected by ${session.user.email}: ${reason}`,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            throw error;
        }

        // TODO: Send rejection email to freelancer with reason

        return NextResponse.json({
            message: 'Verification rejected successfully'
        });

    } catch (error: any) {
        console.error('Error rejecting verification:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to reject verification' },
            { status: 500 }
        );
    }
}
