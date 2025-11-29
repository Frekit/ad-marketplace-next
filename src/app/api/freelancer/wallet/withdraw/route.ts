import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { amount, iban } = await req.json();

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

        if (!iban) {
            return NextResponse.json(
                { error: 'IBAN is required' },
                { status: 400 }
            );
        }

        const supabase = createClient();

        // Process withdrawal
        const { data: transactionId, error: withdrawError } = await supabase.rpc('process_withdrawal', {
            p_freelancer_id: session.user.id,
            p_amount: amount,
            p_iban: iban,
        });

        if (withdrawError) {
            console.error('Withdrawal error:', withdrawError);
            return NextResponse.json(
                { error: withdrawError.message || 'Failed to process withdrawal' },
                { status: 500 }
            );
        }

        // TODO: Integrate with Stripe for actual SEPA transfer
        // For now, we just mark it as pending in the database

        return NextResponse.json({
            message: 'Withdrawal processed successfully',
            transactionId,
            amount,
        });

    } catch (error: any) {
        console.error('Error processing withdrawal:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process withdrawal' },
            { status: 500 }
        );
    }
}
