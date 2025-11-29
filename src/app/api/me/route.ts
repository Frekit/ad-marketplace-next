import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            user: {
                id: session.user.id,
                email: session.user.email,
                role: session.user.role,
                name: session.user.name,
            }
        });

    } catch (error: any) {
        console.error('Error fetching user info:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch user info' },
            { status: 500 }
        );
    }
}
