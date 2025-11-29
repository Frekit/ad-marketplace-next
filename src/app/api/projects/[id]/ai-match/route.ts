import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { findBestMatches } from '@/lib/ai/matching';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        // Only clients can use AI matching for their projects
        if (!session?.user || session.user.role !== 'client') {
            return NextResponse.json(
                { error: 'Unauthorized - Only clients can use AI matching' },
                { status: 401 }
            );
        }

        const { id: projectId } = await params;
        const { searchParams } = new URL(req.url);

        const limit = parseInt(searchParams.get('limit') || '5');
        const minScore = parseFloat(searchParams.get('min_score') || '0.6');

        // Validate OpenAI API key is configured
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'AI matching is not configured. Please contact support.' },
                { status: 503 }
            );
        }

        // Find best matches using AI
        const matches = await findBestMatches(projectId, limit, minScore);

        return NextResponse.json({
            matches,
            count: matches.length,
            metadata: {
                limit,
                min_score: minScore,
                model: 'gpt-4o-mini + text-embedding-3-small'
            }
        });

    } catch (error: any) {
        console.error('Error in AI matching:', error);

        // Handle specific errors
        if (error.message === 'Project not found') {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Failed to find matches' },
            { status: 500 }
        );
    }
}
