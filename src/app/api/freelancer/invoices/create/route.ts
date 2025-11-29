import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';
import {
    validateTaxId,
    validateIBAN,
    generateUniqueInvoiceNumber,
    calculateInvoiceTotals,
    validateInvoiceData
} from '@/lib/invoice-utils';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const {
            projectId,
            milestoneIndex,
            legalName,
            taxId,
            address,
            postalCode,
            city,
            country,
            baseAmount,
            irpfRate,
            description,
            iban,
            swiftBic,
            pdfUrl,
            pdfFilename,
            scenario,
            vatRate,
            vatAmount,
            vatApplicable,
            reverseCharge,
            irpfAmount,
            irpfApplicable,
            subtotal,
            totalAmount,
        } = body;

        // Validate required fields
        if (!projectId || milestoneIndex === undefined || !legalName || !taxId ||
            !address || !postalCode || !city || !country || !baseAmount ||
            !description || !iban || !pdfUrl || !pdfFilename) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate input data
        const validation = validateInvoiceData(body);
        if (!validation.valid) {
            return NextResponse.json(
                { error: 'Validation error', details: validation.errors },
                { status: 400 }
            );
        }

        const supabase = createClient();

        // Verify project belongs to freelancer
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('id, freelancer_id, milestones')
            .eq('id', projectId)
            .eq('freelancer_id', session.user.id)
            .single();

        if (projectError || !project) {
            return NextResponse.json(
                { error: 'Project not found or access denied' },
                { status: 404 }
            );
        }

        // Verify milestone exists and is approved
        const milestones = project.milestones || [];
        if (milestoneIndex >= milestones.length) {
            return NextResponse.json(
                { error: 'Milestone not found' },
                { status: 404 }
            );
        }

        const milestone = milestones[milestoneIndex];
        if (milestone.status !== 'approved') {
            return NextResponse.json(
                { error: 'Milestone must be approved before submitting invoice' },
                { status: 400 }
            );
        }

        // Check verification status for Spanish freelancers
        const { data: wallet } = await supabase
            .from('freelancer_wallets')
            .select('verification_status, country')
            .eq('freelancer_id', session.user.id)
            .single();

        if (wallet?.country === 'ES' && wallet?.verification_status !== 'approved') {
            return NextResponse.json(
                { error: 'You must complete document verification before submitting invoices. Please visit the Verification page.' },
                { status: 403 }
            );
        }

        // Verify base amount matches milestone amount
        if (Math.abs(baseAmount - milestone.amount) > 0.01) {
            return NextResponse.json(
                { error: 'Base amount must match milestone amount' },
                { status: 400 }
            );
        }

        // Check if invoice already exists for this milestone
        const { data: existingInvoice } = await supabase
            .from('invoices')
            .select('id, status')
            .eq('project_id', projectId)
            .eq('milestone_index', milestoneIndex)
            .single();

        if (existingInvoice && existingInvoice.status !== 'rejected') {
            return NextResponse.json(
                { error: 'An invoice already exists for this milestone' },
                { status: 400 }
            );
        }

        // Generate invoice number
        const invoiceNumber = await generateUniqueInvoiceNumber(supabase);

        // Create invoice
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert({
                invoice_number: invoiceNumber,
                freelancer_id: session.user.id,
                project_id: projectId,
                milestone_index: milestoneIndex,
                freelancer_legal_name: legalName,
                freelancer_tax_id: taxId,
                freelancer_address: address,
                freelancer_postal_code: postalCode,
                freelancer_city: city,
                freelancer_country: country,
                tax_scenario: scenario,
                base_amount: baseAmount,
                vat_applicable: vatApplicable,
                vat_rate: vatRate,
                vat_amount: vatAmount,
                reverse_charge: reverseCharge,
                irpf_applicable: irpfApplicable,
                irpf_rate: irpfRate || 0,
                irpf_amount: irpfAmount,
                subtotal: subtotal,
                total_amount: totalAmount,
                issue_date: new Date().toISOString().split('T')[0],
                description: description,
                status: 'pending',
                iban: iban,
                swift_bic: swiftBic || null,
                pdf_url: pdfUrl,
                pdf_filename: pdfFilename,
            })
            .select()
            .single();

        if (invoiceError) {
            console.error('Error creating invoice:', invoiceError);
            return NextResponse.json(
                { error: 'Failed to create invoice' },
                { status: 500 }
            );
        }

        // TODO: Send notification to admin

        return NextResponse.json({
            message: 'Invoice created successfully',
            invoice: invoice,
        });

    } catch (error: any) {
        console.error('Error creating invoice:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create invoice' },
            { status: 500 }
        );
    }
}
