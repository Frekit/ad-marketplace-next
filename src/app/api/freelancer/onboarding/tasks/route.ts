import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

interface OnboardingTask {
    type: string;
    label: string;
    description: string;
    completed: boolean;
    url: string;
    icon: string;
}

interface OnboardingTasksResponse {
    tasks: OnboardingTask[];
    completedCount: number;
    totalTasks: number;
}

export async function GET(req: NextRequest): Promise<NextResponse<OnboardingTasksResponse | { error: string }>> {
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

        // Define all possible tasks with their completion status
        const tasks: OnboardingTask[] = [];
        let completedCount = 0;

        // Task 1: Add Bio/Profile Description
        const bioDone = profile?.bio && profile.bio.trim().length > 0;
        tasks.push({
            type: 'profile_description',
            label: 'Añade una descripción a tu perfil',
            description: 'Cuéntale a los clientes quién eres y qué haces',
            completed: bioDone,
            url: '/freelancer/profile-settings?tab=bio',
            icon: 'Edit',
        });
        if (bioDone) completedCount++;

        // Task 2: Add Skills
        const skillsDone = profile?.skills && Array.isArray(profile.skills) && profile.skills.length >= 3;
        tasks.push({
            type: 'skills',
            label: 'Añade tus habilidades profesionales',
            description: 'Agrega al menos 3 habilidades en las que eres experto',
            completed: skillsDone,
            url: '/freelancer/profile-settings?tab=skills',
            icon: 'Star',
        });
        if (skillsDone) completedCount++;

        // Task 3: Set Hourly Rate
        const rateDone = profile?.hourly_rate && profile.hourly_rate > 0;
        tasks.push({
            type: 'hourly_rate',
            label: 'Establece tu tarifa por hora',
            description: 'Define cuánto cobras por tu trabajo',
            completed: rateDone,
            url: '/freelancer/profile-settings?tab=rate',
            icon: 'DollarSign',
        });
        if (rateDone) completedCount++;

        // Task 4: Add Portfolio Items
        const portfolioCount = portfolioItems?.length || 0;
        const portfolioDone = portfolioCount >= 1;
        tasks.push({
            type: 'portfolio',
            label: 'Añade tu portafolio de trabajos',
            description: 'Muestra ejemplos de tus mejores trabajos',
            completed: portfolioDone,
            url: '/freelancer/profile-settings?tab=portfolio',
            icon: 'Briefcase',
        });
        if (portfolioDone) completedCount++;

        // Task 5: Verify Identity
        const verificationDone = profile?.verification_status === 'approved';
        tasks.push({
            type: 'verification',
            label: 'Verifica tu identidad',
            description: 'Aumenta la confianza de los clientes con una verificación',
            completed: verificationDone,
            url: '/freelancer/verification',
            icon: 'CheckCircle',
        });
        if (verificationDone) completedCount++;

        // Filter out completed tasks if all are complete (optional - for cleaner UI)
        const pendingTasks = tasks.filter(task => !task.completed);
        const displayTasks = pendingTasks.length > 0 ? pendingTasks : tasks;

        return NextResponse.json({
            tasks: displayTasks,
            completedCount,
            totalTasks: tasks.length,
        });

    } catch (error: any) {
        console.error('Error fetching onboarding tasks:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch onboarding tasks' },
            { status: 500 }
        );
    }
}
