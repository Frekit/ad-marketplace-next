import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const projectId = formData.get('projectId') as string;
        const milestoneIndex = formData.get('milestoneIndex') as string;

        if (!file || !projectId || !milestoneIndex) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate file type
        if (file.type !== 'application/pdf') {
            return NextResponse.json(
                { error: 'Only PDF files are allowed' },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File size must be less than 10MB' },
                { status: 400 }
            );
        }

        const supabase = createClient();

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `invoice_${projectId}_${milestoneIndex}_${timestamp}.pdf`;
        const filePath = `invoices/${session.user.id}/${filename}`;

        // Convert File to ArrayBuffer then to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('invoices')
            .upload(filePath, buffer, {
                contentType: 'application/pdf',
                upsert: false,
            });

        if (error) {
            console.error('Supabase storage error:', error);
            return NextResponse.json(
                { error: 'Failed to upload PDF' },
                { status: 500 }
            );
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('invoices')
            .getPublicUrl(filePath);

        return NextResponse.json({
            pdfUrl: urlData.publicUrl,
            pdfFilename: filename,
        });

    } catch (error: any) {
        console.error('Error uploading invoice PDF:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upload PDF' },
            { status: 500 }
        );
    }
}
