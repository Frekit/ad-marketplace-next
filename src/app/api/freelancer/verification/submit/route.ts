import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = createClient();

        // Get current user verification status
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('doc_hacienda_url, doc_seguridad_social_url, doc_autonomo_url, country, verification_status')
            .eq('id', session.user.id)
            .single();

        if (userError) {
            throw userError;
        }

        // Check if all documents are uploaded (for Spanish freelancers)
        if (user.country === 'ES') {
            if (!user.doc_hacienda_url || !user.doc_seguridad_social_url || !user.doc_autonomo_url) {
                return NextResponse.json(
                    { error: 'Please upload all required documents first' },
                    { status: 400 }
                );
            }
        }

        // Check if already submitted or approved
        if (user.verification_status === 'submitted' || user.verification_status === 'approved') {
            return NextResponse.json(
                { error: 'Documents already submitted or approved' },
                { status: 400 }
            );
        }

        // Update status to submitted
        const { error: updateError } = await supabase
            .from('users')
            .update({
                verification_status: 'submitted',
                documents_submitted_at: new Date().toISOString(),
            })
            .eq('id', session.user.id);

        if (updateError) {
            throw updateError;
        }

        // TODO: Send notification to admin

        return NextResponse.json({
            message: 'Documents submitted for review successfully',
        });

    } catch (error: any) {
        console.error('Error submitting documents:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to submit documents' },
            { status: 500 }
        );
    }
}
