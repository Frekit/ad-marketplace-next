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
                { error: `Cannot approve invoice with status: ${invoice.status}` },
                { status: 400 }
            );
        }

        // Update invoice status to approved
        const now = new Date().toISOString();
        const { error: updateError } = await supabase
            .from('invoices')
            .update({
                status: 'approved',
                approved_at: now,
                updated_at: now,
            })
            .eq('id', invoiceId);

        if (updateError) {
            throw updateError;
        }

        // TODO: Send notification to freelancer that invoice was approved

        return NextResponse.json({
            message: 'Invoice approved successfully',
            invoice_id: invoiceId,
            approved_at: now,
        });

    } catch (error: any) {
        console.error('Error approving invoice:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to approve invoice' },
            { status: 500 }
        );
    }
}
