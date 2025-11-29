import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = createClient();

        // Check if user is admin
        const { data: adminUser, error } = await supabase
            .from('admin_users')
            .select('id, email, name, role, permissions, is_active')
            .eq('email', session.user.email)
            .eq('is_active', true)
            .single();

        if (error || !adminUser) {
            return NextResponse.json({
                isAdmin: false,
                admin: null,
            });
        }

        return NextResponse.json({
            isAdmin: true,
            admin: adminUser,
        });

    } catch (error: any) {
        console.error('Error checking admin status:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to check admin status' },
            { status: 500 }
        );
    }
}
