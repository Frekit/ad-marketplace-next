import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Verify admin role
        if (session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            )
        }

        const supabase = createClient()

        // Get all statistics in parallel
        const [
            { data: invoices } = {},
            { data: users } = {},
            { data: projects } = {},
            { data: freelancers } = {},
            { data: clients } = {},
            { data: verificationRequests } = {},
        ] = await Promise.all([
            supabase.from('invoices').select('status, total_amount_eur'),
            supabase.from('users').select('id, role'),
            supabase.from('projects').select('id'),
            supabase.from('users').select('id').eq('role', 'freelancer'),
            supabase.from('users').select('id').eq('role', 'client'),
            supabase.from('users').select('id, email, first_name, last_name, verification_status, documents_submitted_at')
                .eq('verification_status', 'submitted')
                .order('documents_submitted_at', { ascending: false }),
        ])

        const totalInvoices = invoices?.length || 0
        const pendingInvoices = invoices?.filter(i => i.status === 'pending').length || 0
        const approvedInvoices = invoices?.filter(i => i.status === 'approved').length || 0
        const paidInvoices = invoices?.filter(i => i.status === 'paid').length || 0
        const rejectedInvoices = invoices?.filter(i => i.status === 'rejected').length || 0
        // Only count revenue from PAID invoices
        const totalRevenue = invoices?.reduce((sum, i) => {
            return i.status === 'paid' ? sum + (i.total_amount_eur || 0) : sum
        }, 0) || 0
        const totalUsers = users?.length || 0
        const totalProjects = projects?.length || 0
        const totalFreelancers = freelancers?.length || 0
        const totalClients = clients?.length || 0
        const pendingVerifications = verificationRequests?.length || 0

        // Calculate revenue from approved invoices (pending payment)
        const approvedRevenue = invoices?.reduce((sum, i) => {
            return i.status === 'approved' ? sum + (i.total_amount_eur || 0) : sum
        }, 0) || 0

        // Calculate total invoiced amount
        const totalInvoicedAmount = invoices?.reduce((sum, i) => {
            return i.status !== 'rejected' ? sum + (i.total_amount_eur || 0) : sum
        }, 0) || 0

        return NextResponse.json({
            totalInvoices,
            pendingInvoices,
            approvedInvoices,
            paidInvoices,
            rejectedInvoices,
            totalRevenue,
            approvedRevenue,
            totalInvoicedAmount,
            totalUsers,
            totalProjects,
            totalFreelancers,
            totalClients,
            pendingVerifications,
            verificationRequests: verificationRequests || [],
            invoiceStatus: {
                pending: pendingInvoices,
                approved: approvedInvoices,
                paid: paidInvoices,
                rejected: rejectedInvoices,
            },
            revenueBreakdown: {
                paid: totalRevenue,
                approved: approvedRevenue,
                invoiced: totalInvoicedAmount,
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
