import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

interface EarningsStats {
    totalEarned: number;
    pendingEarnings: number;
    approvedEarnings: number;
    thisMonth: number;
    thisYear: number;
    averageInvoiceAmount: number;
    invoiceCount: number;
    invoiceBreakdown: {
        paid: number;
        approved: number;
        pending: number;
        rejected: number;
    };
    monthlyTrend: Array<{
        month: string;
        amount: number;
    }>;
}

export async function GET(req: NextRequest): Promise<NextResponse<{ stats: EarningsStats } | { error: string }>> {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = createClient();

        // Get all invoices for the freelancer
        const { data: invoices, error: invoicesError } = await supabase
            .from('invoices')
            .select('id, total_amount, status, issue_date, created_at')
            .eq('freelancer_id', session.user.id);

        if (invoicesError && invoicesError.code !== 'PGRST116') {
            throw invoicesError;
        }

        const allInvoices = invoices || [];

        // Calculate statistics
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let totalEarned = 0;
        let pendingEarnings = 0;
        let approvedEarnings = 0;
        let thisMonthTotal = 0;
        let thisYearTotal = 0;

        const invoiceBreakdown = {
            paid: 0,
            approved: 0,
            pending: 0,
            rejected: 0
        };

        // Process invoices
        allInvoices.forEach((invoice: any) => {
            const amount = invoice.total_amount || 0;

            // Count by status
            if (invoice.status === 'paid') {
                totalEarned += amount;
                invoiceBreakdown.paid++;
            } else if (invoice.status === 'approved') {
                approvedEarnings += amount;
                invoiceBreakdown.approved++;
            } else if (invoice.status === 'pending') {
                pendingEarnings += amount;
                invoiceBreakdown.pending++;
            } else if (invoice.status === 'rejected') {
                invoiceBreakdown.rejected++;
            }

            // Check if this month/year
            if (invoice.issue_date || invoice.created_at) {
                const invoiceDate = new Date(invoice.issue_date || invoice.created_at);
                if (invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear) {
                    thisMonthTotal += amount;
                }
                if (invoiceDate.getFullYear() === currentYear) {
                    thisYearTotal += amount;
                }
            }
        });

        // Calculate average invoice amount
        const invoiceCount = allInvoices.length;
        const averageInvoiceAmount = invoiceCount > 0 ? totalEarned / invoiceCount : 0;

        // Build monthly trend (last 12 months)
        const monthlyTrend: Array<{ month: string; amount: number }> = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth - i, 1);
            const month = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

            const monthEarnings = allInvoices
                .filter((inv: any) => {
                    const invDate = new Date(inv.issue_date || inv.created_at);
                    return (
                        invDate.getMonth() === date.getMonth() &&
                        invDate.getFullYear() === date.getFullYear() &&
                        inv.status === 'paid'
                    );
                })
                .reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0);

            monthlyTrend.push({
                month,
                amount: monthEarnings
            });
        }

        const stats: EarningsStats = {
            totalEarned: Math.round(totalEarned * 100) / 100,
            pendingEarnings: Math.round(pendingEarnings * 100) / 100,
            approvedEarnings: Math.round(approvedEarnings * 100) / 100,
            thisMonth: Math.round(thisMonthTotal * 100) / 100,
            thisYear: Math.round(thisYearTotal * 100) / 100,
            averageInvoiceAmount: Math.round(averageInvoiceAmount * 100) / 100,
            invoiceCount,
            invoiceBreakdown,
            monthlyTrend
        };

        return NextResponse.json({ stats });

    } catch (error: any) {
        console.error('Error fetching earnings stats:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch earnings statistics' },
            { status: 500 }
        );
    }
}
