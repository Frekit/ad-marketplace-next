import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Freelancer ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role, daily_rate, avatar_url')
      .eq('id', id)
      .eq('role', 'freelancer')
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Freelancer not found' },
        { status: 404 }
      );
    }

    // Get freelancer profile
    const { data: profile, error: profileError } = await supabase
      .from('freelancer_profiles')
      .select('*')
      .eq('user_id', id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
    }

    // Format response
    const freelancer = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: profile?.bio || 'Freelancer',
      hourlyRate: user.daily_rate || 0,
      location: profile?.location || 'Not specified',
      bio: profile?.bio || 'No bio provided',
      skills: profile?.skills || [],
      availability: profile?.availability || 'available',
      avatarUrl: user.avatar_url,
      portfolio: [],
      experience: [],
      certifications: [],
      rating: 5.0,
      reviewCount: 0,
    };

    return NextResponse.json(freelancer);
  } catch (error: any) {
    console.error('Error fetching freelancer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch freelancer' },
      { status: 500 }
    );
  }
}
