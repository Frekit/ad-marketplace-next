import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { isAdmin: false },
                { status: 200 }
            );
        }

        // Check if user has admin role
        const isAdmin = session.user.role === 'admin';

        return NextResponse.json({
            isAdmin,
            user: isAdmin ? {
                email: session.user.email,
                name: session.user.name,
            } : null
        });

    } catch (error: any) {
        console.error('Error checking admin status:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to check admin status' },
            { status: 500 }
        );
    }
}
