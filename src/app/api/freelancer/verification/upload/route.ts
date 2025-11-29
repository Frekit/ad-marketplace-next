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
        const docType = formData.get('docType') as string;

        if (!file || !docType) {
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

        // Validate docType
        if (!['hacienda', 'seguridad_social', 'autonomo'].includes(docType)) {
            return NextResponse.json(
                { error: 'Invalid document type' },
                { status: 400 }
            );
        }

        const supabase = createClient();

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `${docType}_${timestamp}.pdf`;
        const filePath = `verification/${session.user.id}/${filename}`;

        // Convert File to ArrayBuffer then to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('verification-docs')
            .upload(filePath, buffer, {
                contentType: 'application/pdf',
                upsert: false,
            });

        if (error) {
            console.error('Supabase storage error:', error);
            return NextResponse.json(
                { error: 'Failed to upload document' },
                { status: 500 }
            );
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('verification-docs')
            .getPublicUrl(filePath);

        // Update freelancer_wallets with document info
        const updateData: any = {
            [`doc_${docType}_url`]: urlData.publicUrl,
            [`doc_${docType}_filename`]: filename,
            [`doc_${docType}_uploaded_at`]: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
            .from('freelancer_wallets')
            .update(updateData)
            .eq('freelancer_id', session.user.id);

        if (updateError) {
            console.error('Error updating wallet:', updateError);
            return NextResponse.json(
                { error: 'Failed to update document info' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Document uploaded successfully',
            url: urlData.publicUrl,
            filename: filename,
        });

    } catch (error: any) {
        console.error('Error uploading verification document:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upload document' },
            { status: 500 }
        );
    }
}
