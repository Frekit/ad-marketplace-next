// Invoice Types and Interfaces

export type TaxScenario = 'es_domestic' | 'eu_b2b' | 'non_eu';
export type InvoiceStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'paid';

export interface InvoiceTaxCalculation {
  scenario: TaxScenario;
  vatRate: number;
  vatAmount: number;
  irpfRate: number;
  irpfAmount: number;
  subtotal: number;
  totalAmount: number;
}

export interface CreateInvoiceRequest {
  projectId: string;
  milestoneIndex: number;
  legalName: string;
  taxId: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  baseAmount: number;
  irpfRate?: number;
  description: string;
  iban: string;
  swiftBic?: string;
}

export interface Invoice {
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
  
  tax_scenario: TaxScenario;
  base_amount: number;
  
  vat_applicable: boolean;
  vat_rate: number;
  vat_amount: number;
  reverse_charge: boolean;
  
  irpf_applicable: boolean;
  irpf_rate: number;
  irpf_amount: number;
  
  subtotal: number;
  total_amount: number;
  
  issue_date: string;
  due_date?: string;
  description: string;
  
  status: InvoiceStatus;
  rejection_reason?: string;
  
  payment_method: string;
  iban: string;
  swift_bic?: string;
  
  stripe_transfer_id?: string;
  stripe_transfer_status?: string;
  
  pdf_url: string;
  pdf_filename: string;
  
  created_at: string;
  updated_at: string;
  approved_at?: string;
  paid_at?: string;
}

export interface FreelancerWalletLegalData {
  legal_name?: string;
  tax_id?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  default_iban?: string;
  default_swift_bic?: string;
  default_irpf_rate?: number;
  is_autonomo?: boolean;
}

// EU Countries for reverse charge
export const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
];

// Tax ID validation patterns
export const TAX_ID_PATTERNS: Record<string, RegExp> = {
  ES: /^[0-9]{8}[A-Z]$|^[XYZ][0-9]{7}[A-Z]$/, // Spanish NIF/NIE/CIF
  FR: /^[0-9A-Z]{2}[0-9]{9}$/, // SIREN/SIRET
  DE: /^[0-9]{11}$/, // Steuernummer
  IT: /^[0-9]{11}$/, // P.IVA
  // Add more patterns as needed
};

// IBAN validation (basic)
export const IBAN_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
