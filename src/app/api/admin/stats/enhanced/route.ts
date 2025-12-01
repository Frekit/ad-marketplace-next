import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

interface EnhancedStats {
    summary: {
        totalUsers: number;
        totalFreelancers: number;
        totalClients: number;
        totalProjects: number;
    };
    revenue: {
        totalPaid: number;
        totalApproved: number;
        totalInvoiced: number;
        thisMonth: number;
        thisYear: number;
    };
    invoices: {
        total: number;
        pending: number;
        approved: number;
        paid: number;
        rejected: number;
        distribution: {
            status: string;
            count: number;
            percentage: number;
        }[];
    };
    users: {
        total: number;
        freelancers: number;
        clients: number;
        newThisMonth: number;
        newThisYear: number;
    };
    verification: {
        submitted: number;
        approved: number;
        rejected: number;
        approvalRate: number;
    };
}

export async function GET(req: NextRequest): Promise<NextResponse<EnhancedStats | { error: string }>> {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 403 }
            );
        }

        const supabase = createClient();

        // Get current date info
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const thisYearStart = new Date(now.getFullYear(), 0, 1).toISOString();
        const lastYearStart = new Date(now.getFullYear() - 1, 0, 1).toISOString();

        // Fetch all data in parallel
        const [
            { data: invoices } = {},
            { data: users } = {},
            { data: freelancers } = {},
            { data: clients } = {},
            { data: projects } = {},
            { data: verifications } = {},
            { data: usersThisMonth } = {},
            { data: usersThisYear } = {},
        ] = await Promise.all([
            // All invoices
            supabase.from('invoices').select('status, total_amount_eur, created_at'),

            // All users
            supabase.from('users').select('id, role, created_at'),

            // Freelancers
            supabase.from('users').select('id').eq('role', 'freelancer'),

            // Clients
            supabase.from('users').select('id').eq('role', 'client'),

            // Projects
            supabase.from('projects').select('id'),

            // Verification data
            supabase.from('users').select('id, verification_status, created_at')
                .in('verification_status', ['submitted', 'approved', 'rejected']),

            // Users created this month
            supabase.from('users').select('id')
                .gte('created_at', thisMonthStart),

            // Users created this year
            supabase.from('users').select('id')
                .gte('created_at', thisYearStart),
        ]);

        // Calculate summary stats
        const totalUsers = users?.length || 0;
        const totalFreelancers = freelancers?.length || 0;
        const totalClients = clients?.length || 0;
        const totalProjects = projects?.length || 0;

        // Calculate revenue
        const totalPaid = invoices?.reduce((sum, i) =>
            i.status === 'paid' ? sum + (i.total_amount_eur || 0) : sum, 0) || 0;

        const totalApproved = invoices?.reduce((sum, i) =>
            i.status === 'approved' ? sum + (i.total_amount_eur || 0) : sum, 0) || 0;

        const totalInvoiced = invoices?.reduce((sum, i) =>
            i.status !== 'rejected' ? sum + (i.total_amount_eur || 0) : sum, 0) || 0;

        const thisMonth = invoices?.reduce((sum, i) => {
            const invoiceDate = new Date(i.created_at);
            return i.status === 'paid' && invoiceDate >= new Date(thisMonthStart)
                ? sum + (i.total_amount_eur || 0)
                : sum;
        }, 0) || 0;

        const thisYear = invoices?.reduce((sum, i) => {
            const invoiceDate = new Date(i.created_at);
            return i.status === 'paid' && invoiceDate >= new Date(thisYearStart)
                ? sum + (i.total_amount_eur || 0)
                : sum;
        }, 0) || 0;

        // Calculate invoice distribution
        const totalInvoiceCount = invoices?.length || 0;
        const invoiceStats = {
            pending: invoices?.filter(i => i.status === 'pending').length || 0,
            approved: invoices?.filter(i => i.status === 'approved').length || 0,
            paid: invoices?.filter(i => i.status === 'paid').length || 0,
            rejected: invoices?.filter(i => i.status === 'rejected').length || 0,
        };

        const invoiceDistribution = Object.entries(invoiceStats).map(([status, count]) => ({
            status,
            count,
            percentage: totalInvoiceCount > 0 ? Math.round((count / totalInvoiceCount) * 100) : 0
        }));

        // Calculate verification stats
        const submitted = verifications?.filter(v => v.verification_status === 'submitted').length || 0;
        const approved = verifications?.filter(v => v.verification_status === 'approved').length || 0;
        const rejected = verifications?.filter(v => v.verification_status === 'rejected').length || 0;
        const totalVerifications = submitted + approved + rejected;
        const approvalRate = totalVerifications > 0 ? Math.round((approved / totalVerifications) * 100) : 0;

        // Build response
        const stats: EnhancedStats = {
            summary: {
                totalUsers,
                totalFreelancers,
                totalClients,
                totalProjects
            },
            revenue: {
                totalPaid,
                totalApproved,
                totalInvoiced,
                thisMonth,
                thisYear
            },
            invoices: {
                total: totalInvoiceCount,
                pending: invoiceStats.pending,
                approved: invoiceStats.approved,
                paid: invoiceStats.paid,
                rejected: invoiceStats.rejected,
                distribution: invoiceDistribution
            },
            users: {
                total: totalUsers,
                freelancers: totalFreelancers,
                clients: totalClients,
                newThisMonth: usersThisMonth?.length || 0,
                newThisYear: usersThisYear?.length || 0
            },
            verification: {
                submitted,
                approved,
                rejected,
                approvalRate
            }
        };

        return NextResponse.json(stats);

    } catch (error: any) {
        console.error('Error fetching enhanced admin stats:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch enhanced statistics' },
            { status: 500 }
        );
    }
}
