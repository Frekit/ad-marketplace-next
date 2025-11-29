import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = createClient();

        // Get freelancer wallet with verification status
        const { data: wallet, error } = await supabase
            .from('freelancer_wallets')
            .select('verification_status, verification_notes, doc_hacienda_url, doc_hacienda_filename, doc_seguridad_social_url, doc_seguridad_social_filename, doc_autonomo_url, doc_autonomo_filename, country')
            .eq('freelancer_id', session.user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return NextResponse.json(wallet || { verification_status: 'pending', country: 'ES' });

    } catch (error: any) {
        console.error('Error fetching verification status:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch status' },
            { status: 500 }
        );
    }
}
