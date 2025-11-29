'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency, getStatusLabel, getStatusBadgeColor } from '@/lib/invoice-utils';

interface Invoice {
    id: string;
    invoice_number: string;
    project_id: string;
    milestone_index: number;
    base_amount: number;
    total_amount: number;
    status: string;
    rejection_reason?: string;
    created_at: string;
    approved_at?: string;
    paid_at?: string;
    pdf_url?: string;
    projects?: {
        title: string;
    };
}

interface InvoiceListProps {
    initialInvoices?: Invoice[];
}

export default function InvoiceList({ initialInvoices = [] }: InvoiceListProps) {
    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialInvoices.length === 0) {
            fetchInvoices();
        }
    }, [initialInvoices]);

    const fetchInvoices = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/freelancer/invoices');
            if (!response.ok) throw new Error('Failed to fetch invoices');
            const data = await response.json();
            setInvoices(data.invoices || []);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredInvoices = statusFilter
        ? invoices.filter(inv => inv.status === statusFilter)
        : invoices;

    const statusOptions = ['pending', 'under_review', 'approved', 'rejected', 'paid'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Mis Facturas</h2>
                <button
                    onClick={fetchInvoices}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {isLoading ? 'Cargando...' : 'Actualizar'}
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-lg shadow">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filtrar por Estado:
                </label>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setStatusFilter('')}
                        className={`px-3 py-1 rounded-full text-sm ${
                            statusFilter === ''
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                    >
                        Todas
                    </button>
                    {statusOptions.map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1 rounded-full text-sm ${
                                statusFilter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            }`}
                        >
                            {getStatusLabel(status)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Invoices Table */}
            {filteredInvoices.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                    <p className="text-gray-600">
                        {invoices.length === 0 ? 'No tienes facturas aún.' : 'No hay facturas con el estado seleccionado.'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Número</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Proyecto</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Importe</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fecha</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredInvoices.map(invoice => (
                                <tr key={invoice.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {invoice.invoice_number}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {invoice.projects?.title || 'Proyecto Desconocido'}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                        {formatCurrency(invoice.total_amount)}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(invoice.status)}`}>
                                            {getStatusLabel(invoice.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(invoice.created_at).toLocaleDateString('es-ES')}
                                    </td>
                                    <td className="px-6 py-4 text-sm space-x-2">
                                        <Link
                                            href={`/freelancer/invoices/${invoice.id}`}
                                            className="text-blue-600 hover:text-blue-900 font-medium"
                                        >
                                            Ver
                                        </Link>
                                        {invoice.status === 'rejected' && (
                                            <Link
                                                href={`/freelancer/projects/${invoice.project_id}/invoice/new`}
                                                className="text-green-600 hover:text-green-900 font-medium"
                                            >
                                                Reenviar
                                            </Link>
                                        )}
                                        {invoice.pdf_url && (
                                            <a
                                                href={invoice.pdf_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-purple-600 hover:text-purple-900 font-medium"
                                            >
                                                Descargar
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
