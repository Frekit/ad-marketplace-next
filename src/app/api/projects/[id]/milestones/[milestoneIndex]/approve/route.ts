import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; milestoneIndex: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'client') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: projectId, milestoneIndex } = await params;
        const milestoneIdx = parseInt(milestoneIndex);
        const supabase = createClient();

        // Get project details
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .eq('client_id', session.user.id)
            .single();

        if (projectError || !project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        const milestones = project.milestones || [];
        if (milestoneIdx >= milestones.length) {
            return NextResponse.json(
                { error: 'Milestone not found' },
                { status: 404 }
            );
        }

        const milestone = milestones[milestoneIdx];

        if (milestone.status !== 'completed') {
            return NextResponse.json(
                { error: 'Milestone must be marked as completed by freelancer first' },
                { status: 400 }
            );
        }

        // NEW: Check if invoice is approved before releasing payment
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select('id, status')
            .eq('project_id', projectId)
            .eq('milestone_index', milestoneIdx)
            .single();

        if (!invoice) {
            return NextResponse.json(
                { error: 'No invoice found for this milestone. Freelancer must submit an invoice first.' },
                { status: 400 }
            );
        }

        if (invoice.status !== 'approved') {
            return NextResponse.json(
                { error: `Invoice must be approved before payment. Current status: ${invoice.status}` },
                { status: 400 }
            );
        }

        // Process payment
        const { error: paymentError } = await supabase.rpc('complete_milestone_payment', {
            p_project_id: projectId,
            p_milestone_index: milestoneIdx,
            p_amount: milestone.amount,
            p_client_id: session.user.id,
            p_freelancer_id: project.freelancer_id,
        });

        if (paymentError) {
            console.error('Payment error:', paymentError);
            return NextResponse.json(
                { error: 'Failed to process payment' },
                { status: 500 }
            );
        }

        // Update milestone status
        milestones[milestoneIdx].status = 'approved';
        await supabase
            .from('projects')
            .update({ milestones })
            .eq('id', projectId);

        // Check if all milestones are approved
        const allApproved = milestones.every((m: any) => m.status === 'approved');
        if (allApproved) {
            await supabase
                .from('projects')
                .update({ status: 'completed' })
                .eq('id', projectId);
        }

        return NextResponse.json({
            message: 'Milestone approved and payment processed',
            paidAmount: milestone.amount,
        });

    } catch (error: any) {
        console.error('Error approving milestone:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to approve milestone' },
            { status: 500 }
        );
    }
}
