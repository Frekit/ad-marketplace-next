'use client';

import { useState } from 'react';
import { calculateInvoiceTotals, validateInvoiceData, formatCurrency, getCountryName } from '@/lib/invoice-utils';

interface InvoiceFormProps {
    projectId: string;
    milestoneIndex: number;
    milestoneAmount: number;
    onSubmit?: (invoiceData: any) => void;
    isLoading?: boolean;
}

const COUNTRIES = ['ES'];

export default function InvoiceForm({
    projectId,
    milestoneIndex,
    milestoneAmount,
    onSubmit,
    isLoading = false,
}: InvoiceFormProps) {
    const [formData, setFormData] = useState({
        legalName: '',
        taxId: '',
        address: '',
        postalCode: '',
        city: '',
        country: 'ES',
        baseAmount: milestoneAmount.toString(),
        irpfRate: '15',
        description: '',
        iban: '',
        swiftBic: '',
    });

    const [errors, setErrors] = useState<string[]>([]);
    const [showPreview, setShowPreview] = useState(false);

    const taxCalculation = calculateInvoiceTotals(
        parseFloat(formData.baseAmount) || 0,
        formData.country,
        parseFloat(formData.irpfRate) || 15
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Clear errors when user starts typing
        if (errors.length > 0) {
            setErrors([]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form data
        const validation = validateInvoiceData(formData);
        if (!validation.valid) {
            setErrors(validation.errors);
            return;
        }

        // Verify base amount matches milestone
        if (Math.abs(parseFloat(formData.baseAmount) - milestoneAmount) > 0.01) {
            setErrors(['El importe base debe coincidir con el importe del hito']);
            return;
        }

        // Prepare invoice data
        const invoiceData = {
            projectId,
            milestoneIndex,
            legalName: formData.legalName,
            taxId: formData.taxId,
            address: formData.address,
            postalCode: formData.postalCode,
            city: formData.city,
            country: formData.country,
            baseAmount: parseFloat(formData.baseAmount),
            irpfRate: parseFloat(formData.irpfRate),
            description: formData.description,
            iban: formData.iban,
            swiftBic: formData.swiftBic,
            scenario: taxCalculation.scenario,
            vatRate: taxCalculation.vatRate,
            vatAmount: taxCalculation.vatAmount,
            irpfAmount: taxCalculation.irpfAmount,
            subtotal: taxCalculation.subtotal,
            totalAmount: taxCalculation.totalAmount,
        };

        onSubmit?.(invoiceData);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Enviar Factura</h2>

            {errors.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="text-red-800 font-semibold mb-2">Errores en el formulario:</h3>
                    <ul className="list-disc list-inside space-y-1">
                        {errors.map((error, idx) => (
                            <li key={idx} className="text-red-700">{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Legal Data Section */}
                <div className="border-b pb-8">
                    <h3 className="text-lg font-semibold mb-4">Datos Legales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre Legal *
                            </label>
                            <input
                                type="text"
                                name="legalName"
                                value={formData.legalName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ej: Juan Pérez García"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                NIF/CIF *
                            </label>
                            <input
                                type="text"
                                name="taxId"
                                value={formData.taxId}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ej: 12345678A"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                País *
                            </label>
                            <select
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                disabled={true}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
                            >
                                {COUNTRIES.map(code => (
                                    <option key={code} value={code}>
                                        {getCountryName(code)} ({code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dirección *
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ej: Calle Mayor 123"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Código Postal *
                            </label>
                            <input
                                type="text"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ej: 28001"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ciudad *
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ej: Madrid"
                            />
                        </div>
                    </div>
                </div>

                {/* Financial Data Section */}
                <div className="border-b pb-8">
                    <h3 className="text-lg font-semibold mb-4">Datos Financieros</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                IBAN *
                            </label>
                            <input
                                type="text"
                                name="iban"
                                value={formData.iban}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ej: ES0000000000000000000000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                SWIFT/BIC (Opcional)
                            </label>
                            <input
                                type="text"
                                name="swiftBic"
                                value={formData.swiftBic}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ej: BBVAESMM"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Importe Base *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">€</span>
                                <input
                                    type="number"
                                    name="baseAmount"
                                    value={formData.baseAmount}
                                    onChange={handleChange}
                                    step="0.01"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    readOnly
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Basado en el importe del hito</p>
                        </div>

                        {formData.country === 'ES' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tasa IRPF (%) *
                                </label>
                                <select
                                    name="irpfRate"
                                    value={formData.irpfRate}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="7">7%</option>
                                    <option value="15">15% (Estándar)</option>
                                    <option value="19">19%</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Invoice Details Section */}
                <div className="border-b pb-8">
                    <h3 className="text-lg font-semibold mb-4">Detalles de la Factura</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Servicios de desarrollo web - Hito 1"
                        />
                    </div>
                </div>

                {/* Tax Calculation Preview */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Resumen de Cálculo</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Importe Base:</span>
                            <span className="font-semibold">{formatCurrency(parseFloat(formData.baseAmount) || 0)}</span>
                        </div>

                        {taxCalculation.scenario === 'es_domestic' && (
                            <>
                                <div className="flex justify-between">
                                    <span>IVA (21%):</span>
                                    <span className="text-green-600">+ {formatCurrency(taxCalculation.vatAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span className="font-semibold">{formatCurrency(taxCalculation.subtotal)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                    <span>IRPF ({taxCalculation.irpfRate}%):</span>
                                    <span className="text-red-600">- {formatCurrency(taxCalculation.irpfAmount)}</span>
                                </div>
                            </>
                        )}

                        {taxCalculation.scenario === 'eu_b2b' && (
                            <div className="flex justify-between text-gray-600">
                                <span>Régimen B2B (Sin IVA/IRPF):</span>
                                <span>-</span>
                            </div>
                        )}

                        <div className="flex justify-between text-lg font-bold border-t pt-2 mt-4">
                            <span>Total a Transferir:</span>
                            <span className="text-green-700">{formatCurrency(taxCalculation.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 justify-end">
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        disabled={isLoading}
                    >
                        {showPreview ? 'Ocultar Vista Previa' : 'Vista Previa'}
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Enviando...' : 'Enviar Factura'}
                    </button>
                </div>
            </form>
        </div>
    );
}
