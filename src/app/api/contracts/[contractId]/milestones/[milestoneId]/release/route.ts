import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ contractId: string; milestoneId: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'client') {
            return NextResponse.json(
                { error: 'Unauthorized. Only clients can release payments.' },
                { status: 401 }
            );
        }

        const { contractId, milestoneId } = await params;

        const supabase = createClient();

        // Get contract
        const { data: contract, error: contractError } = await supabase
            .from('contracts')
            .select('*')
            .eq('id', contractId)
            .single();

        if (contractError || !contract) {
            return NextResponse.json(
                { error: 'Contract not found' },
                { status: 404 }
            );
        }

        if (contract.client_id !== session.user.id) {
            return NextResponse.json(
                { error: 'This contract does not belong to you' },
                { status: 403 }
            );
        }

        // Find milestone
        const milestones = contract.milestones || [];
        const milestoneIndex = milestones.findIndex((m: any) => m.id === parseInt(milestoneId));

        if (milestoneIndex === -1) {
            return NextResponse.json(
                { error: 'Milestone not found' },
                { status: 404 }
            );
        }

        const milestone = milestones[milestoneIndex];

        if (milestone.status !== 'completed') {
            return NextResponse.json(
                { error: 'Milestone must be completed before releasing payment' },
                { status: 400 }
            );
        }

        if (milestone.status === 'approved') {
            return NextResponse.json(
                { error: 'Payment already released for this milestone' },
                { status: 400 }
            );
        }

        // Release payment using stored procedure
        const { error: releaseError } = await supabase.rpc('release_milestone_payment', {
            p_contract_id: contractId,
            p_milestone_index: milestoneIndex,
            p_amount: milestone.amount,
        });

        if (releaseError) {
            throw releaseError;
        }

        // Update milestone status
        milestones[milestoneIndex] = {
            ...milestone,
            status: 'approved',
            approved_at: new Date().toISOString(),
        };

        // Update contract
        const { error: updateError } = await supabase
            .from('contracts')
            .update({
                milestones,
                paid_amount: contract.paid_amount + milestone.amount,
                updated_at: new Date().toISOString(),
            })
            .eq('id', contractId);

        if (updateError) {
            throw updateError;
        }

        // Check if all milestones are approved
        const allApproved = milestones.every((m: any) => m.status === 'approved');
        if (allApproved) {
            await supabase
                .from('contracts')
                .update({ status: 'completed', completed_at: new Date().toISOString() })
                .eq('id', contractId);

            await supabase
                .from('projects')
                .update({ status: 'completed' })
                .eq('id', contract.project_id);
        }

        return NextResponse.json({
            message: `Payment of €${milestone.amount} released successfully`,
            allCompleted: allApproved,
        });

    } catch (error: any) {
        console.error('Error releasing payment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to release payment' },
            { status: 500 }
        );
    }
}
