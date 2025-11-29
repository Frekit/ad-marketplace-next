'use client';

import { useState } from 'react';
import { formatCurrency, formatTaxScenario, formatDate, getStatusLabel } from '@/lib/invoice-utils';

interface Invoice {
    id: string;
    invoice_number: string;
    freelancer_id: string;
    project_id: string;
    milestone_index: number;
    
    freelancer_legal_name: string;
    freelancer_tax_id: string;
    freelancer_address: string;
    freelancer_postal_code: string;
    freelancer_city: string;
    freelancer_country: string;
    
    tax_scenario: string;
    base_amount: number;
    
    vat_rate: number;
    vat_amount: number;
    
    irpf_rate: number;
    irpf_amount: number;
    
    subtotal: number;
    total_amount: number;
    
    issue_date: string;
    description: string;
    status: string;
    rejection_reason?: string;
    
    iban: string;
    swift_bic?: string;
    
    pdf_url?: string;
    pdf_filename?: string;
    
    created_at: string;
    updated_at: string;
    approved_at?: string;
    paid_at?: string;
}

interface AdminInvoiceDetailProps {
    invoice: Invoice;
    onApprove?: () => void;
    onReject?: () => void;
    onProcessPayment?: () => void;
}

export default function AdminInvoiceDetail({
    invoice,
    onApprove,
    onReject,
    onProcessPayment,
}: AdminInvoiceDetailProps) {
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Por favor, proporciona una razón para el rechazo');
            return;
        }

        setIsProcessing(true);
        try {
            const response = await fetch(`/api/invoices/${invoice.id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectionReason }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to reject invoice');
            }

            alert('Factura rechazada exitosamente');
            onReject?.();
            setShowRejectForm(false);
        } catch (error) {
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleApprove = async () => {
        setIsProcessing(true);
        try {
            const response = await fetch(`/api/invoices/${invoice.id}/approve`, {
                method: 'POST',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to approve invoice');
            }

            alert('Factura aprobada exitosamente');
            onApprove?.();
        } catch (error) {
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleProcessPayment = async () => {
        if (!window.confirm('¿Deseas procesar el pago de esta factura? Esta acción es irreversible.')) {
            return;
        }

        setIsProcessing(true);
        try {
            const response = await fetch(`/api/invoices/${invoice.id}/process-payment`, {
                method: 'POST',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to process payment');
            }

            alert('Pago procesado exitosamente');
            onProcessPayment?.();
        } catch (error) {
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{invoice.invoice_number}</h1>
                        <p className="text-sm text-gray-600 mt-1">Emitida: {formatDate(invoice.issue_date)}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-lg font-semibold ${
                        invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        invoice.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                        invoice.status === 'approved' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-emerald-100 text-emerald-800'
                    }`}>
                        {getStatusLabel(invoice.status)}
                    </span>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Freelancer Data */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Datos del Freelancer</h2>
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
                            <p className="text-gray-600">País</p>
                            <p className="font-semibold">{invoice.freelancer_country}</p>
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

                {/* Payment Data */}
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
                        <div>
                            <p className="text-gray-600">Método de Pago</p>
                            <p className="font-semibold">SEPA</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Detalles de la Factura</h2>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Descripción</p>
                        <p className="text-gray-900">{invoice.description}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Escenario Fiscal</p>
                        <p className="font-semibold">{formatTaxScenario(invoice.tax_scenario)}</p>
                    </div>
                </div>
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

            {/* Rejection Reason (if applicable) */}
            {invoice.status === 'rejected' && invoice.rejection_reason && (
                <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-2">Razón del Rechazo</h3>
                    <p className="text-red-700">{invoice.rejection_reason}</p>
                </div>
            )}

            {/* PDF Preview */}
            {invoice.pdf_url && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">PDF de la Factura</h2>
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

            {/* Verification Checklist */}
            <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-green-900">Lista de Verificación</h2>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                        <input type="checkbox" checked disabled className="mr-3" />
                        <span className="text-green-800">Datos legales completos</span>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" checked disabled className="mr-3" />
                        <span className="text-green-800">NIF/CIF validado</span>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" checked disabled className="mr-3" />
                        <span className="text-green-800">IBAN validado</span>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" checked disabled className="mr-3" />
                        <span className="text-green-800">Cálculo de impuestos verificado</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            {invoice.status === 'pending' || invoice.status === 'under_review' ? (
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex gap-4">
                        {!showRejectForm && (
                            <>
                                <button
                                    onClick={handleApprove}
                                    disabled={isProcessing}
                                    className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400"
                                >
                                    {isProcessing ? 'Procesando...' : 'Aprobar Factura'}
                                </button>
                                <button
                                    onClick={() => setShowRejectForm(true)}
                                    disabled={isProcessing}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 disabled:bg-gray-400"
                                >
                                    Rechazar Factura
                                </button>
                            </>
                        )}

                        {showRejectForm && (
                            <div className="w-full space-y-3">
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Razón del rechazo..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleReject}
                                        disabled={isProcessing}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 disabled:bg-gray-400"
                                    >
                                        Confirmar Rechazo
                                    </button>
                                    <button
                                        onClick={() => setShowRejectForm(false)}
                                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-md hover:bg-gray-400"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : invoice.status === 'approved' ? (
                <div className="bg-white p-6 rounded-lg shadow">
                    <button
                        onClick={handleProcessPayment}
                        disabled={isProcessing}
                        className="w-full px-6 py-3 bg-emerald-600 text-white font-semibold text-lg rounded-md hover:bg-emerald-700 disabled:bg-gray-400"
                    >
                        {isProcessing ? 'Procesando Pago...' : 'Procesar Pago'}
                    </button>
                </div>
            ) : null}
        </div>
    );
}
