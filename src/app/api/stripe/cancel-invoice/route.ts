import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getStripeClient } from '@/lib/stripe';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { invoiceId } = await req.json();

        if (!invoiceId) {
            return NextResponse.json(
                { error: 'Invoice ID is required' },
                { status: 400 }
            );
        }

        // Void the invoice in Stripe
        const stripe = getStripeClient();
        const voidedInvoice = await stripe.invoices.voidInvoice(invoiceId);

        return NextResponse.json({
            success: true,
            invoice: {
                id: voidedInvoice.id,
                status: voidedInvoice.status,
                number: voidedInvoice.number,
            },
        });
    } catch (error: any) {
        console.error('Error canceling invoice:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to cancel invoice' },
            { status: 500 }
        );
    }
}
