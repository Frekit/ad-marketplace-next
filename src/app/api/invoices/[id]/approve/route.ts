import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';
import { notifyUser, notificationTemplates } from '@/lib/notifications';
import { applyRateLimit, addRateLimitHeaders, logRequest } from '@/lib/api-middleware';
import { rateLimitConfig } from '@/lib/rate-limit';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const startTime = Date.now();

    // Apply rate limiting (100 requests per minute for general API endpoints)
    const rateLimit = applyRateLimit(req, '/api/invoices/approve', rateLimitConfig.api);
    if (rateLimit instanceof NextResponse) {
        logRequest('POST', '/api/invoices/approve', 429, Date.now() - startTime, req);
        return rateLimit;
    }

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

        // Check if this invoice is linked to a withdrawal request
        const { data: withdrawalRequest, error: withdrawalFetchError } = await supabase
            .from('withdrawal_requests')
            .select('*')
            .eq('freelancer_id', invoice.freelancer_id)
            .in('status', ['pending_invoice', 'pending_approval'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        // If there's a withdrawal request, link it and update status
        if (withdrawalRequest && !withdrawalFetchError) {
            const { error: linkError } = await supabase
                .from('withdrawal_requests')
                .update({
                    invoice_id: invoiceId,
                    status: 'pending_approval',
                    updated_at: now,
                })
                .eq('id', withdrawalRequest.id);

            if (linkError) {
                console.error('Error linking invoice to withdrawal request:', linkError);
            }
        }

        // Get freelancer email for notification
        const { data: freelancer, error: freelancerError } = await supabase
            .from('users')
            .select('id, email')
            .eq('id', invoice.freelancer_id)
            .single();

        if (freelancer && freelancer.email) {
            const template = notificationTemplates.INVOICE_APPROVED(
                invoice.invoice_number || `#${invoiceId}`,
                invoice.total_amount
            );

            await notifyUser(
                freelancer.id,
                freelancer.email,
                template.type,
                template.title,
                template.message,
                { invoiceId, amount: invoice.total_amount }
            );
        }

        const response = NextResponse.json({
            message: 'Invoice approved successfully',
            invoice_id: invoiceId,
            approved_at: now,
            withdrawal_request_linked: !!withdrawalRequest,
        });

        const responseWithHeaders = addRateLimitHeaders(response, rateLimit.headers);
        logRequest('POST', '/api/invoices/approve', 200, Date.now() - startTime, req, session?.user?.id);
        return responseWithHeaders;

    } catch (error: any) {
        console.error('Error approving invoice:', error);
        logRequest('POST', '/api/invoices/approve', 500, Date.now() - startTime, req);
        return NextResponse.json(
            { error: error.message || 'Failed to approve invoice' },
            { status: 500 }
        );
    }
}
