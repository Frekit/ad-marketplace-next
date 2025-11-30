import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

/**
 * GET /api/freelancer/billing-data
 *
 * Returns billing information that freelancer needs to create their own invoice
 * Including: amount earned, tax ID, billing address, client details, etc.
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

        // 1. Get freelancer data
        const { data: freelancer, error: freelancerError } = await supabase
            .from('users')
            .select(`
                id,
                first_name,
                last_name,
                email,
                tax_id,
                billing_name,
                billing_address,
                billing_city,
                billing_postal_code,
                billing_country
            `)
            .eq('id', session.user.id)
            .single();

        if (freelancerError) {
            throw freelancerError;
        }

        // 2. Get wallet balance (total earned)
        const { data: wallet } = await supabase
            .from('freelancer_wallets')
            .select('available_balance, total_earned')
            .eq('freelancer_id', session.user.id)
            .single();

        // 3. Get platform/client info (your company info that should be on the invoice)
        // This would be your platform's details - stored in env or config
        const platformInfo = {
            name: process.env.NEXT_PUBLIC_PLATFORM_NAME || 'Malt Ad Marketplace',
            tax_id: process.env.NEXT_PUBLIC_PLATFORM_TAX_ID || '',
            address: process.env.NEXT_PUBLIC_PLATFORM_ADDRESS || '',
            city: process.env.NEXT_PUBLIC_PLATFORM_CITY || '',
            postal_code: process.env.NEXT_PUBLIC_PLATFORM_POSTAL_CODE || '',
            country: process.env.NEXT_PUBLIC_PLATFORM_COUNTRY || 'ES',
        };

        // 4. Get recent projects/work for reference
        const { data: projects } = await supabase
            .from('contracts')
            .select(`
                id,
                total_amount,
                started_at,
                completed_at,
                projects (
                    title
                )
            `)
            .eq('freelancer_id', session.user.id)
            .order('started_at', { ascending: false })
            .limit(10);

        return NextResponse.json({
            freelancer: {
                name: `${freelancer.first_name} ${freelancer.last_name}`,
                tax_id: freelancer.tax_id,
                billing_name: freelancer.billing_name,
                billing_address: freelancer.billing_address,
                billing_city: freelancer.billing_city,
                billing_postal_code: freelancer.billing_postal_code,
                billing_country: freelancer.billing_country,
                email: freelancer.email,
            },
            billing_summary: {
                total_earned: wallet?.total_earned || 0,
                available_balance: wallet?.available_balance || 0,
                currency: 'EUR',
            },
            client_info: platformInfo,
            recent_projects: projects || [],
            instructions: {
                step_1: 'Use the information above to create your invoice in your accounting software',
                step_2: 'Make sure to include the complete amount in "available_balance" as the base amount (base imponible)',
                step_3: 'Add applicable taxes (IVA, IRPF) according to your tax situation',
                step_4: 'Download or export the invoice as PDF',
                step_5: 'Upload the PDF to the invoices section in your dashboard',
                step_6: 'We will review and approve your invoice',
                step_7: 'Once approved, you can request payment'
            }
        });

    } catch (error: any) {
        console.error('Error fetching billing data:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch billing data' },
            { status: 500 }
        );
    }
}
