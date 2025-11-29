import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const supabase = createClient()

        // Verify admin access
        const { data: adminUser, error: adminError } = await supabase
            .from('admin_users')
            .select('id')
            .eq('email', session.user.email)
            .eq('is_active', true)
            .single()

        if (adminError || !adminUser) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            )
        }

        // Get all statistics in parallel
        const [
            { data: invoices } = {},
            { data: users } = {},
            { count: totalProjects } = {},
            { data: freelancers } = {},
            { data: clients } = {},
        ] = await Promise.all([
            supabase.from('invoices').select('status, total_amount_eur'),
            supabase.from('users').select('id, role'),
            supabase.from('projects').select('id', { count: 'exact', head: true }),
            supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'freelancer'),
            supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'client'),
        ])

        const totalInvoices = invoices?.length || 0
        const pendingInvoices = invoices?.filter(i => i.status === 'pending').length || 0
        const approvedInvoices = invoices?.filter(i => i.status === 'approved').length || 0
        const paidInvoices = invoices?.filter(i => i.status === 'paid').length || 0
        const rejectedInvoices = invoices?.filter(i => i.status === 'rejected').length || 0
        const totalRevenue = invoices?.reduce((sum, i) => sum + (i.total_amount_eur || 0), 0) || 0
        const totalUsers = users?.length || 0

        return NextResponse.json({
            totalInvoices,
            pendingInvoices,
            approvedInvoices,
            paidInvoices,
            rejectedInvoices,
            totalRevenue,
            totalUsers,
            totalProjects,
            totalFreelancers: freelancers?.length || 0,
            totalClients: clients?.length || 0,
            invoiceStatus: {
                pending: pendingInvoices,
                approved: approvedInvoices,
                paid: paidInvoices,
                rejected: rejectedInvoices,
            },
        })

    } catch (error: any) {
        console.error('Error fetching admin stats:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch stats' },
            { status: 500 }
        )
    }
}
