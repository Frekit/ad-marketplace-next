import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';
import AdminInvoiceDetail from '@/components/admin-invoice-detail';
import Link from 'next/link';

export default async function AdminInvoiceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
        redirect('/sign-in');
    }

    const { id } = await params;
    const supabase = createClient();

    const { data: invoice, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !invoice) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
                    <p className="text-red-700">Factura no encontrada</p>
                    <Link href="/admin/invoices" className="text-blue-600 hover:underline mt-4 inline-block">
                        Volver al panel
                    </Link>
                </div>
            </div>
        );
    }

    // Fetch associated withdrawal request if it exists
    const { data: withdrawalRequest } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('invoice_id', id)
        .single();

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="mb-6">
                <Link
                    href="/admin/invoices"
                    className="text-blue-600 hover:text-blue-900 font-medium"
                >
                    ← Volver al panel de facturas
                </Link>
            </div>
            <AdminInvoiceDetail invoice={invoice} withdrawalRequest={withdrawalRequest || null} />
        </div>
    );
}
