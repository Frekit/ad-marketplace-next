// Tax calculation utilities for invoice system

export const EU_COUNTRIES = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
];

export const SUPPORTED_COUNTRIES = ['ES'];

export type TaxScenario = 'es_domestic' | 'eu_b2b' | 'non_eu';

export interface InvoiceCalculation {
    scenario: TaxScenario;
    baseAmount: number;
    vatRate: number;
    vatAmount: number;
    vatApplicable: boolean;
    reverseCharge: boolean;
    irpfRate: number;
    irpfAmount: number;
    irpfApplicable: boolean;
    subtotal: number;
    totalAmount: number;
}

export function isEUCountry(countryCode: string): boolean {
    return EU_COUNTRIES.includes(countryCode.toUpperCase());
}

export function calculateInvoiceTotals(
    baseAmount: number,
    country: string,
    irpfRate: number = 15
): InvoiceCalculation {
    const countryUpper = country.toUpperCase();
    let scenario: TaxScenario;
    let vatRate = 0;
    let vatAmount = 0;
    let irpfAmount = 0;
    let vatApplicable = true;
    let reverseCharge = false;
    let irpfApplicable = false;

    if (countryUpper === 'ES') {
        // Spanish domestic invoice
        scenario = 'es_domestic';
        vatRate = 21;
        vatAmount = Math.round(baseAmount * 0.21 * 100) / 100;
        irpfApplicable = true;
        irpfAmount = Math.round(baseAmount * (irpfRate / 100) * 100) / 100;
    } else if (isEUCountry(countryUpper)) {
        // EU B2B - Reverse charge
        scenario = 'eu_b2b';
        vatRate = 0;
        vatAmount = 0;
        reverseCharge = true;
        irpfApplicable = false;
        irpfAmount = 0;
    } else {
        // Non-EU (US, etc.) - No VAT, no IRPF
        scenario = 'non_eu';
        vatRate = 0;
        vatAmount = 0;
        vatApplicable = false;
        irpfApplicable = false;
        irpfAmount = 0;
    }

    const subtotal = Math.round((baseAmount + vatAmount) * 100) / 100;
    const totalAmount = Math.round((subtotal - irpfAmount) * 100) / 100;

    return {
        scenario,
        baseAmount,
        vatRate,
        vatAmount,
        vatApplicable,
        reverseCharge,
        irpfRate,
        irpfAmount,
        irpfApplicable,
        subtotal,
        totalAmount,
    };
}

export function generateInvoiceNumber(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-5);

    return `INV-${year}-${month}-${timestamp}`;
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount);
}

export function validateTaxId(taxId: string, country: string): boolean {
    const countryUpper = country.toUpperCase();

    if (countryUpper === 'ES') {
        // Spanish NIF/CIF validation (simplified)
        const nifRegex = /^[0-9]{8}[A-Z]$/;
        const cifRegex = /^[A-Z][0-9]{7}[A-Z0-9]$/;
        return nifRegex.test(taxId) || cifRegex.test(taxId);
    }

    // For other countries, just check it's not empty
    // In production, implement proper VAT number validation
    return taxId.length > 0;
}

export function validateIBAN(iban: string): boolean {
    // Remove spaces and convert to uppercase
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();

    // Basic IBAN format check (2 letters + 2 digits + up to 30 alphanumeric)
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;

    return ibanRegex.test(cleanIban);
}

export function validateSwiftBic(bic: string): boolean {
    if (!bic) return true; // Optional field
    // SWIFT/BIC: 8 or 11 characters, letters and digits
    const swiftRegex = /^[A-Z0-9]{8}([A-Z0-9]{3})?$/;
    return swiftRegex.test(bic.toUpperCase());
}

export function getStatusBadgeColor(status: string): string {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        under_review: 'bg-blue-100 text-blue-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        paid: 'bg-emerald-100 text-emerald-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        pending: 'Pendiente',
        under_review: 'En revisión',
        approved: 'Aprobado',
        rejected: 'Rechazado',
        paid: 'Pagado',
    };
    return labels[status] || status;
}

export function validateInvoiceData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.legalName || data.legalName.trim().length === 0) {
        errors.push('El nombre legal es requerido');
    }

    if (!data.taxId || data.taxId.trim().length === 0) {
        errors.push('El NIF/CIF es requerido');
    } else if (!validateTaxId(data.taxId, data.country)) {
        errors.push('El formato de NIF/CIF no es válido para el país seleccionado');
    }

    if (!data.address || data.address.trim().length === 0) {
        errors.push('La dirección es requerida');
    }

    if (!data.postalCode || data.postalCode.trim().length === 0) {
        errors.push('El código postal es requerido');
    }

    if (!data.city || data.city.trim().length === 0) {
        errors.push('La ciudad es requerida');
    }

    if (!data.country || data.country.length === 0) {
        errors.push('El país es requerido');
    }

    if (!data.baseAmount || data.baseAmount <= 0) {
        errors.push('El importe base debe ser mayor que 0');
    }

    if (!data.description || data.description.trim().length === 0) {
        errors.push('La descripción es requerida');
    }

    if (!data.iban || !validateIBAN(data.iban)) {
        errors.push('El IBAN no es válido');
    }

    if (data.swiftBic && !validateSwiftBic(data.swiftBic)) {
        errors.push('El código SWIFT/BIC no es válido');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

export function generatePdfFilename(invoiceNumber: string): string {
    const timestamp = Date.now();
    return `invoice_${invoiceNumber.replace(/-/g, '_')}_${timestamp}.pdf`;
}

export function getCountryName(countryCode: string): string {
    const countries: Record<string, string> = {
        ES: 'España',
        FR: 'Francia',
        DE: 'Alemania',
        IT: 'Italia',
        PT: 'Portugal',
        BE: 'Bélgica',
        NL: 'Países Bajos',
        AT: 'Austria',
        PL: 'Polonia',
        GR: 'Grecia',
    };
    return countries[countryCode.toUpperCase()] || countryCode;
}

export function formatTaxScenario(scenario: string): string {
    const labels: Record<string, string> = {
        es_domestic: 'Residente España (IVA + IRPF)',
        eu_b2b: 'UE - Régimen B2B (Sin IVA)',
        non_eu: 'Fuera UE',
    };
    return labels[scenario] || scenario;
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
}

export function calculateDueDate(issueDate: Date, daysUntilDue: number = 30): Date {
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + daysUntilDue);
    return dueDate;
}

export async function generateUniqueInvoiceNumber(supabaseClient: any): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const startDate = `${year}-${month}-01T00:00:00Z`;

    const lastDay = new Date(year, parseInt(month), 0).getDate();
    const endDate = `${year}-${month}-${lastDay}T23:59:59Z`;

    const { data, error } = await supabaseClient
        .from('invoices')
        .select('id', { count: 'exact' })
        .gte('created_at', startDate)
        .lte('created_at', endDate);

    if (error) {
        throw new Error(`Failed to generate invoice number: ${error.message}`);
    }

    const count = (data?.length || 0) + 1;
    const sequence = String(count).padStart(5, '0');

    return `INV-${year}-${month}-${sequence}`;
}
