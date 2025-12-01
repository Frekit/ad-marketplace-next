import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

interface DashboardOverview {
    stats: {
        profileCompletion: number;
        profileViews: number;
        proposalsReceived: number;
        activeProjects: number;
        missingFields?: string[];
        viewTrend?: number;
        viewTrendDirection?: 'up' | 'down' | 'stable';
    };
    earnings: {
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
    };
    proposals: any[];
    tasks: any[];
    milestones: any[];
}

// Simple in-memory cache with TTL
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // 60 seconds

function getFromCache(key: string) {
    const item = cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > CACHE_TTL) {
        cache.delete(key);
        return null;
    }
    return item.data;
}

function setCache(key: string, data: any) {
    cache.set(key, { data, timestamp: Date.now() });
}

export async function GET(req: NextRequest): Promise<NextResponse<DashboardOverview | { error: string }>> {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const freelancerId = session.user.id;
        const cacheKey = `dashboard:${freelancerId}`;

        // Check cache first
        const cachedData = getFromCache(cacheKey);
        if (cachedData) {
            return NextResponse.json(cachedData);
        }

        const supabase = createClient();

        // Fetch all data in parallel
        const [
            { data: invoices, error: invoicesError },
            { data: profileViews, error: viewsError },
            { data: proposals, error: proposalsError },
            { data: onboardingTasks, error: tasksError },
            { data: milestones, error: milestonesError },
            { data: activeProjects, error: projectsError },
            { data: freelancerData, error: profileError }
        ] = await Promise.all([
            supabase.from('invoices').select('id, total_amount, status, issue_date, created_at').eq('freelancer_id', freelancerId),
            supabase.from('profile_views').select('viewer_type, viewer_id, viewed_at').eq('freelancer_id', freelancerId).gte('viewed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
            supabase.from('proposals').select('id, project:projects(id, title, description, skills_required, created_at), client:clients(name, company), status, created_at').eq('freelancer_id', freelancerId).order('created_at', { ascending: false }).limit(10),
            supabase.from('onboarding_tasks').select('*').eq('freelancer_id', freelancerId),
            supabase.from('project_milestones').select('id, name, due_date, amount, project_id, project:projects(title)').eq('freelancer_id', freelancerId).gte('due_date', new Date().toISOString()).order('due_date', { ascending: true }).limit(10),
            supabase.from('freelancer_projects').select('id, status, project_id, project:projects(title)').in('status', ['active', 'in_progress']).eq('freelancer_id', freelancerId),
            supabase.from('freelancers').select('description, skills, hourly_rate, portfolio_items').eq('id', freelancerId).single()
        ]);

        // Calculate earnings stats
        const allInvoices = invoices || [];
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

        allInvoices.forEach((invoice: any) => {
            const amount = invoice.total_amount || 0;

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

        const invoiceCount = allInvoices.length;
        const averageInvoiceAmount = invoiceCount > 0 ? totalEarned / invoiceCount : 0;

        // Calculate profile stats
        const views = profileViews || [];
        let clientViews = 0;
        let guestViews = 0;
        let freelancerViews = 0;

        views.forEach((view: any) => {
            if (view.viewer_type === 'client') clientViews++;
            else if (view.viewer_type === 'guest') guestViews++;
            else if (view.viewer_type === 'freelancer') freelancerViews++;
        });

        const totalViews = views.length;

        // Calculate profile completion
        const freelancer = (freelancerData || {}) as any;
        let completionScore = 0;
        const missingFields: string[] = [];

        if (!freelancer.description) missingFields.push('description');
        if (!freelancer.skills || (Array.isArray(freelancer.skills) && freelancer.skills.length === 0)) missingFields.push('skills');
        if (!freelancer.hourly_rate) missingFields.push('hourly_rate');
        if (!freelancer.portfolio_items || (Array.isArray(freelancer.portfolio_items) && freelancer.portfolio_items.length === 0)) missingFields.push('portfolio_items');

        completionScore = Math.max(0, 100 - (missingFields.length * 25));

        // Format milestones
        const formattedMilestones = (milestones || []).map((m: any) => {
            const now = new Date();
            const dueDate = new Date(m.due_date);
            const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            return {
                id: m.id,
                projectId: m.project_id,
                projectTitle: m.project?.title || 'Unknown Project',
                milestoneName: m.name,
                dueDate: m.due_date,
                amount: m.amount,
                daysUntilDue
            };
        });

        const response: DashboardOverview = {
            stats: {
                profileCompletion: completionScore,
                profileViews: totalViews,
                proposalsReceived: (proposals || []).length,
                activeProjects: (activeProjects || []).length,
                missingFields,
                viewTrend: 0,
                viewTrendDirection: 'stable'
            },
            earnings: {
                totalEarned: Math.round(totalEarned * 100) / 100,
                pendingEarnings: Math.round(pendingEarnings * 100) / 100,
                approvedEarnings: Math.round(approvedEarnings * 100) / 100,
                thisMonth: Math.round(thisMonthTotal * 100) / 100,
                thisYear: Math.round(thisYearTotal * 100) / 100,
                averageInvoiceAmount: Math.round(averageInvoiceAmount * 100) / 100,
                invoiceCount,
                invoiceBreakdown
            },
            proposals: proposals || [],
            tasks: onboardingTasks || [],
            milestones: formattedMilestones
        };

        // Cache the response
        setCache(cacheKey, response);

        return NextResponse.json(response);

    } catch (error: any) {
        console.error('Error fetching dashboard overview:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch dashboard overview' },
            { status: 500 }
        );
    }
}
