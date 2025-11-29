import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ contractId: string; milestoneId: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized. Only freelancers can complete milestones.' },
                { status: 401 }
            );
        }

        const { contractId, milestoneId } = await params;
        const { deliverables } = await req.json();

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

        if (contract.freelancer_id !== session.user.id) {
            return NextResponse.json(
                { error: 'This contract does not belong to you' },
                { status: 403 }
            );
        }

        // Update milestone status
        const milestones = contract.milestones || [];
        const milestoneIndex = milestones.findIndex((m: any) => m.id === parseInt(milestoneId));

        if (milestoneIndex === -1) {
            return NextResponse.json(
                { error: 'Milestone not found' },
                { status: 404 }
            );
        }

        const milestone = milestones[milestoneIndex];

        if (milestone.status === 'completed' || milestone.status === 'approved') {
            return NextResponse.json(
                { error: 'Milestone already completed' },
                { status: 400 }
            );
        }

        milestones[milestoneIndex] = {
            ...milestone,
            status: 'completed',
            completed_at: new Date().toISOString(),
            deliverables: deliverables || '',
        };

        // Update contract
        const { error: updateError } = await supabase
            .from('contracts')
            .update({
                milestones,
                updated_at: new Date().toISOString(),
            })
            .eq('id', contractId);

        if (updateError) {
            throw updateError;
        }

        // TODO: Notify client about milestone completion

        return NextResponse.json({
            message: 'Milestone marked as complete. Awaiting client approval.',
        });

    } catch (error: any) {
        console.error('Error completing milestone:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to complete milestone' },
            { status: 500 }
        );
    }
}
