import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'freelancer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { daily_rate } = await req.json();

    if (daily_rate === undefined || daily_rate === null) {
      return NextResponse.json(
        { error: 'daily_rate is required' },
        { status: 400 }
      );
    }

    if (typeof daily_rate !== 'number' || daily_rate < 0) {
      return NextResponse.json(
        { error: 'daily_rate must be a non-negative number' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from('users')
      .update({ daily_rate })
      .eq('id', session.user.id)
      .select('id, daily_rate')
      .single();

    if (error) {
      console.error('Error updating daily rate:', error);
      return NextResponse.json(
        { error: 'Failed to update daily rate' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      daily_rate: data.daily_rate
    });
  } catch (error) {
    console.error('Error in update-rate route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
