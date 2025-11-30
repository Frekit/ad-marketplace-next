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

        // Get user basic info including daily_rate and avatar_url
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, email, first_name, last_name, daily_rate, avatar_url')
            .eq('id', session.user.id)
            .single();

        if (userError || !user) {
            throw userError || new Error('User not found');
        }

        // Get freelancer profile
        const { data: profile, error: profileError } = await supabase
            .from('freelancer_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

        if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
        }

        // Get freelancer wallet data (includes legal info)
        const { data: wallet, error: walletError } = await supabase
            .from('freelancer_wallets')
            .select('*')
            .eq('freelancer_id', session.user.id)
            .single();

        if (walletError && walletError.code !== 'PGRST116') {
            throw walletError;
        }

        return NextResponse.json({
            user,
            profile: profile || {},
            wallet: wallet || {}
        });

    } catch (error: any) {
        console.error('Error fetching freelancer profile:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const supabase = createClient();

        // Validate input
        const { first_name, last_name, bio, hourly_rate, skills, availability } = body;

        // Update user basic info if provided
        if (first_name || last_name || hourly_rate !== undefined) {
            const updateData: any = {};
            if (first_name) updateData.first_name = first_name;
            if (last_name) updateData.last_name = last_name;
            if (hourly_rate !== undefined) {
                // Save hourly_rate (which represents daily rate now) to the users table
                updateData.daily_rate = hourly_rate ? parseFloat(hourly_rate) : null;
            }

            const { error: updateUserError } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', session.user.id);

            if (updateUserError) {
                throw updateUserError;
            }
        }

        // Update or create freelancer profile
        if (bio !== undefined || hourly_rate !== undefined || skills !== undefined || availability !== undefined) {
            const profileData = {
                user_id: session.user.id,
                ...(bio !== undefined && { bio }),
                ...(hourly_rate !== undefined && { hourly_rate: parseFloat(hourly_rate) }),
                ...(skills !== undefined && { skills: Array.isArray(skills) ? skills : [] }),
                ...(availability !== undefined && { availability }),
            };

            const { error: profileError } = await supabase
                .from('freelancer_profiles')
                .upsert(profileData, { onConflict: 'user_id' });

            if (profileError) {
                throw profileError;
            }
        }

        // Fetch updated profile
        const { data: updatedProfile, error: fetchError } = await supabase
            .from('freelancer_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
        }

        return NextResponse.json({
            message: 'Profile updated successfully',
            profile: updatedProfile || {}
        });

    } catch (error: any) {
        console.error('Error updating freelancer profile:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update profile' },
            { status: 500 }
        );
    }
}
