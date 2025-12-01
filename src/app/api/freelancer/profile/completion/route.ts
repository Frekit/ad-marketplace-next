import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

interface CompletionResponse {
    completionPercentage: number;
    completedFields: string[];
    missingFields: string[];
    breakdown: {
        bio: boolean;
        skills: boolean;
        hourlyRate: boolean;
        portfolioItems: boolean;
        verification: boolean;
    };
}

export async function GET(req: NextRequest): Promise<NextResponse<CompletionResponse | { error: string }>> {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = createClient();

        // Get freelancer profile data
        const { data: profile, error: profileError } = await supabase
            .from('freelancer_profiles')
            .select('bio, skills, hourly_rate, verification_status')
            .eq('user_id', session.user.id)
            .single();

        if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
        }

        // Get portfolio items count
        const { data: portfolioItems, error: portfolioError } = await supabase
            .from('portfolio_items')
            .select('id', { count: 'exact', head: true })
            .eq('freelancer_id', session.user.id);

        if (portfolioError) {
            throw portfolioError;
        }

        // Calculate which fields are complete
        const completedFields: string[] = [];
        const missingFields: string[] = [];
        const breakdown = {
            bio: false,
            skills: false,
            hourlyRate: false,
            portfolioItems: false,
            verification: false,
        };

        // Check Bio (20%)
        if (profile?.bio && profile.bio.trim().length > 0) {
            completedFields.push('bio');
            breakdown.bio = true;
        } else {
            missingFields.push('bio');
        }

        // Check Skills (20%)
        if (profile?.skills && Array.isArray(profile.skills) && profile.skills.length >= 3) {
            completedFields.push('skills');
            breakdown.skills = true;
        } else {
            missingFields.push('skills');
        }

        // Check Hourly Rate (20%)
        if (profile?.hourly_rate && profile.hourly_rate > 0) {
            completedFields.push('hourly_rate');
            breakdown.hourlyRate = true;
        } else {
            missingFields.push('hourly_rate');
        }

        // Check Portfolio Items (20%)
        const portfolioCount = portfolioItems?.length || 0;
        if (portfolioCount >= 1) {
            completedFields.push('portfolio');
            breakdown.portfolioItems = true;
        } else {
            missingFields.push('portfolio');
        }

        // Check Verification (20%)
        if (profile?.verification_status === 'approved') {
            completedFields.push('verification');
            breakdown.verification = true;
        } else {
            missingFields.push('verification');
        }

        // Calculate completion percentage
        const completionPercentage = (completedFields.length / 5) * 100;

        return NextResponse.json({
            completionPercentage: Math.round(completionPercentage),
            completedFields,
            missingFields,
            breakdown,
        });

    } catch (error: any) {
        console.error('Error calculating profile completion:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to calculate profile completion' },
            { status: 500 }
        );
    }
}
