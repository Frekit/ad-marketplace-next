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

    // Get freelancer verification status from users table
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        country,
        verification_status,
        verification_notes,
        doc_hacienda_url,
        doc_hacienda_filename,
        doc_seguridad_social_url,
        doc_seguridad_social_filename,
        doc_autonomo_url,
        doc_autonomo_filename
      `)
      .eq('id', session.user.id)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      verification_status: user.verification_status || 'pending',
      verification_notes: user.verification_notes,
      doc_hacienda_url: user.doc_hacienda_url,
      doc_hacienda_filename: user.doc_hacienda_filename,
      doc_seguridad_social_url: user.doc_seguridad_social_url,
      doc_seguridad_social_filename: user.doc_seguridad_social_filename,
      doc_autonomo_url: user.doc_autonomo_url,
      doc_autonomo_filename: user.doc_autonomo_filename,
      country: user.country || 'ES',
    });

  } catch (error: any) {
    console.error('Error fetching verification status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch verification status' },
      { status: 500 }
    );
  }
}
