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
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        const { id: invoiceId } = await params;
        const { reason } = await req.json();

        if (!reason || reason.trim().length === 0) {
            return NextResponse.json(
                { error: 'Rejection reason is required' },
                { status: 400 }
            );
        }

        const supabase = createClient();

        // Get invoice
        const { data: invoice, error: fetchError } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', invoiceId)
            .single();

        if (fetchError || !invoice) {
            return NextResponse.json(
                { error: 'Invoice not found' },
                { status: 404 }
            );
        }

        // Verify invoice is in correct status
        if (invoice.status !== 'pending' && invoice.status !== 'under_review') {
            return NextResponse.json(
                { error: `Cannot reject invoice with status: ${invoice.status}` },
                { status: 400 }
            );
        }

        // Update invoice status to rejected
        const now = new Date().toISOString();
        const { error: updateError } = await supabase
            .from('invoices')
            .update({
                status: 'rejected',
                rejection_reason: reason,
                updated_at: now,
            })
            .eq('id', invoiceId);

        if (updateError) {
            throw updateError;
        }

        // TODO: Send notification to freelancer with rejection reason

        return NextResponse.json({
            message: 'Invoice rejected successfully',
            invoice_id: invoiceId,
            rejection_reason: reason,
        });

    } catch (error: any) {
        console.error('Error rejecting invoice:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to reject invoice' },
            { status: 500 }
        );
    }
}
