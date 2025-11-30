import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const supabase = createClient();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status') || 'submitted';

        // Get verification requests
        const { data: verifications, error } = await supabase
            .from('users')
            .select('id, email, first_name, last_name, country, verification_status, verification_notes, doc_hacienda_url, doc_hacienda_filename, doc_seguridad_social_url, doc_seguridad_social_filename, doc_autonomo_url, doc_autonomo_filename, documents_submitted_at')
            .eq('verification_status', status)
            .order('documents_submitted_at', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json({ verifications: verifications || [] });

    } catch (error: any) {
        console.error('Error fetching verifications:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch verifications' },
            { status: 500 }
        );
    }
}
