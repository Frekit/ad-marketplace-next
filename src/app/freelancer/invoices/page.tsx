import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';
import InvoiceList from '@/components/invoice-list';

export default async function FreelancerInvoicesPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'freelancer') {
        redirect('/sign-in');
    }

    const supabase = createClient();

    // Fetch invoices for this freelancer
    const { data: invoices } = await supabase
        .from('invoices')
        .select(`
            *,
            projects:project_id (
                title,
                client_id
            )
        `)
        .eq('freelancer_id', session.user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <InvoiceList initialInvoices={invoices || []} />
        </div>
    );
}
