import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getStripeClient } from '@/lib/stripe';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'client') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { amount, poCode, billingDetails } = await req.json();

        // Validate inputs
        if (!amount || amount < 10) {
            return NextResponse.json(
                { error: 'Minimum deposit is €10' },
                { status: 400 }
            );
        }

        if (!poCode) {
            return NextResponse.json(
                { error: 'Purchase Order (Orden de Compra) code is required' },
                { status: 400 }
            );
        }

        if (!billingDetails || !billingDetails.tax_id || !billingDetails.name || !billingDetails.address) {
            return NextResponse.json(
                { error: 'Complete billing details are required' },
                { status: 400 }
            );
        }

        // 1. Find or Create Customer
        const stripe = getStripeClient();
        const customers = await stripe.customers.list({
            email: session.user.email!,
            limit: 1,
        });

        let customerId = customers.data.length > 0 ? customers.data[0].id : null;

        if (!customerId) {
            const newCustomer = await stripe.customers.create({
                email: session.user.email!,
                name: billingDetails.name,
                metadata: {
                    userId: session.user.id!,
                },
            });
            customerId = newCustomer.id;
        }

        // 2. Update Customer with Billing Details
        await stripe.customers.update(customerId, {
            name: billingDetails.name,
            address: {
                line1: billingDetails.address,
                city: billingDetails.city,
                postal_code: billingDetails.postal_code,
                country: billingDetails.country || 'ES',
            },
            metadata: {
                userId: session.user.id!,
                tax_id: billingDetails.tax_id, // Store in metadata instead
            }
        });

        // 3. Create Invoice Item (Pending Item)
        await stripe.invoiceItems.create({
            customer: customerId,
            amount: Math.round(amount * 100), // Cents
            currency: 'eur',
            description: `Wallet Deposit - PO: ${poCode}`,
        });

        // 4. Create Invoice
        const invoice = await stripe.invoices.create({
            customer: customerId,
            collection_method: 'send_invoice',
            days_until_due: 30,
            custom_fields: [
                { name: 'Orden de Compra', value: poCode },
            ],
            metadata: {
                userId: session.user.id!,
                type: 'wallet_deposit',
                poCode: poCode,
            },
        });

        // 5. Finalize Invoice (This generates the PDF and numbers)
        const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

        return NextResponse.json({
            invoiceId: finalizedInvoice.id,
            url: finalizedInvoice.hosted_invoice_url,
            pdf: finalizedInvoice.invoice_pdf,
            number: finalizedInvoice.number
        });

    } catch (error: any) {
        console.error('Error creating invoice:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create invoice' },
            { status: 500 }
        );
    }
}
