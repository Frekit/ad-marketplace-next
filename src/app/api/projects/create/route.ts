import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'client') {
            return NextResponse.json(
                { error: 'Unauthorized. Only clients can create projects.' },
                { status: 401 }
            );
        }

        const { title, description, skills } = await req.json();

        // Validate inputs
        if (!title || !description || !skills || skills.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields: title, description, and skills' },
                { status: 400 }
            );
        }

        const supabase = createClient();

        // Create project (no budget, no locked funds yet)
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert({
                client_id: session.user.id,
                title,
                description,
                skills_required: skills,
                status: 'draft', // Will become 'active' when freelancer offer is accepted
            })
            .select()
            .single();

        if (projectError) {
            throw projectError;
        }

        return NextResponse.json({
            projectId: project.id,
            message: 'Project proposal created successfully',
        });

    } catch (error: any) {
        console.error('Error creating project:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create project' },
            { status: 500 }
        );
    }
}
