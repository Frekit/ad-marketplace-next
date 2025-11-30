import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'client') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = createClient();

        // Get user basic info
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, email, first_name, last_name, company_name')
            .eq('id', session.user.id)
            .single();

        if (userError || !user) {
            throw userError || new Error('User not found');
        }

        return NextResponse.json({
            user
        });

    } catch (error: any) {
        console.error('Error fetching client profile:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'client') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const supabase = createClient();

        // Validate input
        const { first_name, last_name, company_name } = body;

        // Update user info
        if (first_name || last_name || company_name !== undefined) {
            const { error: updateUserError } = await supabase
                .from('users')
                .update({
                    ...(first_name && { first_name }),
                    ...(last_name && { last_name }),
                    ...(company_name !== undefined && { company_name }),
                })
                .eq('id', session.user.id);

            if (updateUserError) {
                throw updateUserError;
            }
        }

        // Fetch updated user
        const { data: updatedUser, error: fetchError } = await supabase
            .from('users')
            .select('id, email, first_name, last_name, company_name')
            .eq('id', session.user.id)
            .single();

        if (fetchError) {
            throw fetchError;
        }

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error: any) {
        console.error('Error updating client profile:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update profile' },
            { status: 500 }
        );
    }
}
