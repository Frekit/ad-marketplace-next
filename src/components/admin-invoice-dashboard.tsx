'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency, getStatusLabel, getStatusBadgeColor } from '@/lib/invoice-utils';

interface Invoice {
    id: string;
    invoice_number: string;
    freelancer_id: string;
    project_id: string;
    base_amount: number;
    total_amount: number;
    status: string;
    created_at: string;
    freelancer?: {
        first_name: string;
        last_name: string;
        email: string;
    };
    projects?: {
        title: string;
    };
}

interface AdminInvoiceDashboardProps {
    initialInvoices?: Invoice[];
}

export default function AdminInvoiceDashboard({ initialInvoices = [] }: AdminInvoiceDashboardProps) {
    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
    const [statusFilter, setStatusFilter] = useState<string>('pending');
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        paid: 0,
    });

    useEffect(() => {
        fetchInvoices();
    }, [statusFilter]);

    const fetchInvoices = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/invoices?status=${statusFilter}`);
            if (!response.ok) throw new Error('Failed to fetch invoices');
            const data = await response.json();
            setInvoices(data.invoices || []);

            // Calculate stats
            setStats({
                total: data.total || 0,
                pending: await fetchStatusCount('pending'),
                approved: await fetchStatusCount('approved'),
                rejected: await fetchStatusCount('rejected'),
                paid: await fetchStatusCount('paid'),
            });
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStatusCount = async (status: string): Promise<number> => {
        try {
            const response = await fetch(`/api/invoices?status=${status}&limit=1`);
            if (!response.ok) return 0;
            const data = await response.json();
            return data.total || 0;
        } catch {
            return 0;
        }
    };

    const statusOptions = [
        { value: 'pending', label: 'Pendientes', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'under_review', label: 'En Revisión', color: 'bg-blue-100 text-blue-800' },
        { value: 'approved', label: 'Aprobadas', color: 'bg-green-100 text-green-800' },
        { value: 'rejected', label: 'Rechazadas', color: 'bg-red-100 text-red-800' },
        { value: 'paid', label: 'Pagadas', color: 'bg-emerald-100 text-emerald-800' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Panel de Revisión de Facturas</h2>
                <button
                    onClick={fetchInvoices}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {isLoading ? 'Cargando...' : 'Actualizar'}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg shadow border-l-4 border-yellow-400">
                    <p className="text-sm text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg shadow border-l-4 border-blue-400">
                    <p className="text-sm text-gray-600">En Revisión</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.approved}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg shadow border-l-4 border-red-400">
                    <p className="text-sm text-gray-600">Rechazadas</p>
                    <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg shadow border-l-4 border-emerald-400">
                    <p className="text-sm text-gray-600">Pagadas</p>
                    <p className="text-2xl font-bold text-emerald-700">{stats.paid}</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-lg shadow">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filtrar por Estado:
                </label>
                <div className="flex gap-2 flex-wrap">
                    {statusOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setStatusFilter(option.value)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                                statusFilter === option.value
                                    ? `${option.color} ring-2 ring-offset-2 ring-gray-400`
                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Invoices Table */}
            {invoices.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                    <p className="text-gray-600">No hay facturas con el estado seleccionado.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Número</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Freelancer</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Proyecto</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Importe</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fecha</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {invoices.map(invoice => (
                                <tr key={invoice.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {invoice.invoice_number}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="font-medium">
                                            {invoice.freelancer?.first_name} {invoice.freelancer?.last_name}
                                        </div>
                                        <div className="text-xs text-gray-500">{invoice.freelancer?.email}</div>
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
                                    <td className="px-6 py-4 text-sm">
                                        <Link
                                            href={`/admin/invoices/${invoice.id}`}
                                            className="text-blue-600 hover:text-blue-900 font-medium"
                                        >
                                            Revisar
                                        </Link>
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
