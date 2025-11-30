import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

/**
 * POST /api/freelancer/withdrawal/initiate
 *
 * Freelancer initiates a withdrawal request
 * This BLOCKS the specified amount from available_balance
 * Returns withdrawal request with details for invoice creation
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { amount } = await req.json();
        const supabase = createClient();

        // Validation
        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Invalid amount' },
                { status: 400 }
            );
        }

        if (amount < 10) {
            return NextResponse.json(
                { error: 'Minimum withdrawal amount is €10' },
                { status: 400 }
            );
        }

        // Get current wallet balance
        const { data: wallet, error: walletError } = await supabase
            .from('freelancer_wallets')
            .select('available_balance, total_earned')
            .eq('freelancer_id', session.user.id)
            .single();

        if (walletError) {
            throw walletError;
        }

        if (!wallet || wallet.available_balance < amount) {
            return NextResponse.json(
                {
                    error: `Insufficient balance. Available: €${wallet?.available_balance?.toFixed(2) || '0.00'}`,
                    available_balance: wallet?.available_balance || 0
                },
                { status: 400 }
            );
        }

        // Check for existing pending withdrawals (can only have one active)
        const { data: existingWithdrawal } = await supabase
            .from('withdrawal_requests')
            .select('id, status')
            .eq('freelancer_id', session.user.id)
            .in('status', ['pending_invoice', 'pending_approval'])
            .single();

        if (existingWithdrawal) {
            return NextResponse.json(
                {
                    error: `You already have a withdrawal request in progress (Status: ${existingWithdrawal.status}). Please complete or cancel it first.`,
                    existing_withdrawal_id: existingWithdrawal.id
                },
                { status: 400 }
            );
        }

        // Create withdrawal request (this blocks the money)
        const { data: withdrawalRequest, error: createError } = await supabase
            .from('withdrawal_requests')
            .insert({
                freelancer_id: session.user.id,
                amount: amount,
                status: 'pending_invoice',
                available_balance_before: wallet.available_balance,
                amount_blocked: amount,
                base_amount: amount,
                vat_amount: Math.round(amount * 0.21 * 100) / 100, // 21% VAT
                invoice_expected_by: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            })
            .select()
            .single();

        if (createError) {
            throw createError;
        }

        // Update wallet - reduce available_balance (block the money)
        const { error: updateError } = await supabase
            .from('freelancer_wallets')
            .update({
                available_balance: wallet.available_balance - amount
            })
            .eq('freelancer_id', session.user.id);

        if (updateError) {
            // Rollback withdrawal request if wallet update fails
            await supabase
                .from('withdrawal_requests')
                .delete()
                .eq('id', withdrawalRequest.id);
            throw updateError;
        }

        // Get user data for invoice generation
        const { data: userData } = await supabase
            .from('users')
            .select('first_name, last_name, email, tax_id, billing_address, billing_city, billing_postal_code, billing_country')
            .eq('id', session.user.id)
            .single();

        return NextResponse.json({
            success: true,
            withdrawal_request_id: withdrawalRequest.id,
            status: 'pending_invoice',
            amount_blocked: amount,
            vat_amount: withdrawalRequest.vat_amount,
            total_with_vat: amount + withdrawalRequest.vat_amount,
            invoice_expected_by: withdrawalRequest.invoice_expected_by,
            new_available_balance: wallet.available_balance - amount,

            // Billing data for freelancer to create invoice
            billing_data: {
                freelancer: {
                    name: `${userData?.first_name} ${userData?.last_name}`,
                    tax_id: userData?.tax_id,
                    address: userData?.billing_address,
                    city: userData?.billing_city,
                    postal_code: userData?.billing_postal_code,
                    country: userData?.billing_country,
                    email: userData?.email,
                },
                withdrawal_amount: amount,
                vat_rate: 21,
                vat_amount: withdrawalRequest.vat_amount,
                total_with_vat: amount + withdrawalRequest.vat_amount,
                currency: 'EUR',
                instructions: [
                    `Base imponible (Monto a facturar): €${amount.toFixed(2)}`,
                    `IVA 21%: €${withdrawalRequest.vat_amount.toFixed(2)}`,
                    `Total factura: €${(amount + withdrawalRequest.vat_amount).toFixed(2)}`,
                    'Aplica retenciones (IRPF) si corresponde a tu caso',
                    'Incluye el RFC/NIF de Malt Ad Marketplace como cliente',
                    'Descarga el PDF y súbelo en la sección de facturas',
                ]
            },

            message: `Retiro de €${amount.toFixed(2)} iniciado. El dinero está bloqueado. Por favor crea tu factura con los datos anteriores.`
        });

    } catch (error: any) {
        console.error('Error initiating withdrawal:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to initiate withdrawal' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/freelancer/withdrawal/initiate
 * Get current pending withdrawal request for this freelancer
 */
export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = createClient();

        const { data: withdrawalRequest, error } = await supabase
            .from('withdrawal_requests')
            .select('*')
            .eq('freelancer_id', session.user.id)
            .in('status', ['pending_invoice', 'pending_approval', 'approved'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            throw error;
        }

        if (!withdrawalRequest) {
            return NextResponse.json({ withdrawal_request: null });
        }

        return NextResponse.json({ withdrawal_request: withdrawalRequest });

    } catch (error: any) {
        console.error('Error fetching withdrawal request:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch withdrawal request' },
            { status: 500 }
        );
    }
}
