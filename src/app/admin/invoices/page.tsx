import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';
import AdminInvoiceDashboard from '@/components/admin-invoice-dashboard';

export default async function AdminInvoicesPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
        redirect('/sign-in');
    }

    const supabase = createClient();

    // Fetch pending invoices by default
    const { data: invoices } = await supabase
        .from('invoices')
        .select(`
            *,
            freelancer:freelancer_id (
                id,
                first_name,
                last_name,
                email
            ),
            projects:project_id (
                title,
                client_id
            )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <AdminInvoiceDashboard initialInvoices={invoices || []} />
        </div>
    );
}
