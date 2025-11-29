import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';
import { formatCurrency, formatTaxScenario, formatDate, getStatusLabel } from '@/lib/invoice-utils';

export default async function FreelancerInvoiceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();

    if (!session?.user || session.user.role !== 'freelancer') {
        redirect('/sign-in');
    }

    const { id } = await params;
    const supabase = createClient();

    const { data: invoice, error } = await supabase
        .from('invoices')
        .select(`
            *,
            projects:project_id (
                title,
                client_id
            )
        `)
        .eq('id', id)
        .eq('freelancer_id', session.user.id)
        .single();

    if (error || !invoice) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
                    <p className="text-red-700">Factura no encontrada</p>
                    <Link href="/freelancer/invoices" className="text-blue-600 hover:underline mt-4 inline-block">
                        Volver a mis facturas
                    </Link>
                </div>
            </div>
        );
    }

    const statusColorMap: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        under_review: 'bg-blue-100 text-blue-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        paid: 'bg-emerald-100 text-emerald-800',
    };
    
    const statusColor = statusColorMap[invoice.status] || 'bg-gray-100 text-gray-800';

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{invoice.invoice_number}</h1>
                            <p className="text-sm text-gray-600 mt-1">Emitida: {formatDate(invoice.issue_date)}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-lg font-semibold ${statusColor}`}>
                            {getStatusLabel(invoice.status)}
                        </span>
                    </div>
                </div>

                {/* Project Info */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-2">Proyecto</h2>
                    <p className="text-gray-900 font-medium">{invoice.projects?.title}</p>
                    <p className="text-sm text-gray-600 mt-1">Hito #{invoice.milestone_index + 1}</p>
                </div>

                {/* Tax Calculation */}
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Cálculo de Impuestos</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Importe Base:</span>
                            <span className="font-semibold">{formatCurrency(invoice.base_amount)}</span>
                        </div>

                        {invoice.tax_scenario === 'es_domestic' && (
                            <>
                                <div className="flex justify-between">
                                    <span>IVA ({invoice.vat_rate}%):</span>
                                    <span className="text-green-600">+ {formatCurrency(invoice.vat_amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                    <span>IRPF ({invoice.irpf_rate}%):</span>
                                    <span className="text-red-600">- {formatCurrency(invoice.irpf_amount)}</span>
                                </div>
                            </>
                        )}

                        {invoice.tax_scenario === 'eu_b2b' && (
                            <div className="flex justify-between text-gray-600">
                                <span>Régimen B2B (Sin IVA/IRPF):</span>
                                <span>-</span>
                            </div>
                        )}

                        <div className="flex justify-between text-lg font-bold border-t pt-2 mt-4">
                            <span>Total a Transferir:</span>
                            <span className="text-green-700">{formatCurrency(invoice.total_amount)}</span>
                        </div>
                    </div>
                </div>

                {/* Invoice Details */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Tus Datos</h2>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-600">Nombre Legal</p>
                                <p className="font-semibold">{invoice.freelancer_legal_name}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">NIF/CIF</p>
                                <p className="font-semibold font-mono">{invoice.freelancer_tax_id}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Dirección</p>
                                <p className="font-semibold">
                                    {invoice.freelancer_address}<br/>
                                    {invoice.freelancer_postal_code} {invoice.freelancer_city}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Datos de Pago</h2>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-600">IBAN</p>
                                <p className="font-semibold font-mono">{invoice.iban}</p>
                            </div>
                            {invoice.swift_bic && (
                                <div>
                                    <p className="text-gray-600">SWIFT/BIC</p>
                                    <p className="font-semibold font-mono">{invoice.swift_bic}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Rejection Reason */}
                {invoice.status === 'rejected' && invoice.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                        <h3 className="font-semibold text-red-800 mb-2">Razón del Rechazo</h3>
                        <p className="text-red-700 mb-4">{invoice.rejection_reason}</p>
                        <Link
                            href={`/freelancer/projects/${invoice.project_id}/invoice/new?milestone=${invoice.milestone_index}`}
                            className="inline-block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Enviar Factura Corregida
                        </Link>
                    </div>
                )}

                {/* PDF Download */}
                {invoice.pdf_url && (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <a
                            href={invoice.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                            Descargar PDF
                        </a>
                    </div>
                )}

                {/* Back Link */}
                <div>
                    <Link
                        href="/freelancer/invoices"
                        className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                        ← Volver a mis facturas
                    </Link>
                </div>
            </div>
        </div>
    );
}
