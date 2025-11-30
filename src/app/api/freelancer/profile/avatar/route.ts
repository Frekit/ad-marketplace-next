import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { avatar_url } = await req.json();

    if (!avatar_url) {
      return NextResponse.json(
        { error: 'avatar_url is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from('users')
      .update({ avatar_url })
      .eq('id', session.user.id)
      .select('avatar_url')
      .single();

    if (error) {
      console.error('Error updating avatar:', error);
      return NextResponse.json(
        { error: 'Failed to update avatar' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      avatar_url: data.avatar_url
    });
  } catch (error) {
    console.error('Error in avatar update route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
