import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        // Only clients can search for freelancers
        if (!session?.user || session.user.role !== 'client') {
            return NextResponse.json(
                { error: 'Unauthorized - Only clients can search freelancers' },
                { status: 401 }
            );
        }

        const supabase = createClient();
        const { searchParams } = new URL(req.url);

        // Extract search parameters
        const q = searchParams.get('q'); // keyword search (name, bio)
        const skills = searchParams.get('skills'); // comma-separated
        const minRate = searchParams.get('min_rate');
        const maxRate = searchParams.get('max_rate');
        const availability = searchParams.get('availability'); // available, busy, unavailable
        const sort = searchParams.get('sort') || 'rating_desc'; // rating_desc, rate_asc, rate_desc, newest

        // Build query - join users with freelancer_profiles
        let query = supabase
            .from('users')
            .select(`
                id,
                email,
                first_name,
                last_name,
                created_at,
                freelancer_profiles!inner (
                    id,
                    hourly_rate,
                    skills,
                    bio,
                    availability,
                    rating,
                    total_jobs,
                    total_earnings,
                    profile_completion
                )
            `)
            .eq('role', 'freelancer');

        // Apply keyword search (first_name, last_name, or bio)
        if (q) {
            query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,freelancer_profiles.bio.ilike.%${q}%`);
        }

        // Apply skills filter (freelancers that have at least one of the requested skills)
        if (skills) {
            const skillsArray = skills.split(',').map(s => s.trim());
            query = query.overlaps('freelancer_profiles.skills', skillsArray);
        }

        // Apply hourly rate filters
        if (minRate) {
            query = query.gte('freelancer_profiles.hourly_rate', parseFloat(minRate));
        }
        if (maxRate) {
            query = query.lte('freelancer_profiles.hourly_rate', parseFloat(maxRate));
        }

        // Apply availability filter
        if (availability) {
            query = query.eq('freelancer_profiles.availability', availability);
        }

        // Apply sorting
        switch (sort) {
            case 'rating_desc':
                query = query.order('rating', {
                    ascending: false,
                    nullsFirst: false,
                    foreignTable: 'freelancer_profiles'
                });
                break;
            case 'rate_asc':
                query = query.order('hourly_rate', {
                    ascending: true,
                    nullsFirst: false,
                    foreignTable: 'freelancer_profiles'
                });
                break;
            case 'rate_desc':
                query = query.order('hourly_rate', {
                    ascending: false,
                    nullsFirst: false,
                    foreignTable: 'freelancer_profiles'
                });
                break;
            case 'newest':
                query = query.order('created_at', { ascending: false });
                break;
            default:
                query = query.order('rating', {
                    ascending: false,
                    nullsFirst: false,
                    foreignTable: 'freelancer_profiles'
                });
        }

        const { data: freelancers, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        // Transform the data to flatten the structure
        const transformedFreelancers = freelancers?.map(freelancer => ({
            id: freelancer.id,
            email: freelancer.email,
            first_name: freelancer.first_name,
            last_name: freelancer.last_name,
            created_at: freelancer.created_at,
            profile: Array.isArray(freelancer.freelancer_profiles)
                ? freelancer.freelancer_profiles[0]
                : freelancer.freelancer_profiles
        })) || [];

        return NextResponse.json({
            freelancers: transformedFreelancers,
            count: transformedFreelancers.length
        });

    } catch (error: any) {
        console.error('Error searching freelancers:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to search freelancers' },
            { status: 500 }
        );
    }
}
