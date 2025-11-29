'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InvoiceForm from '@/components/invoice-form';
import { createClient } from '@/lib/supabase';

export default function InvoiceSubmissionPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [projectId, setProjectId] = useState<string>('');
    const [milestoneIndex, setMilestoneIndex] = useState<number>(0);
    const [milestoneAmount, setMilestoneAmount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const loadProjectData = async () => {
            try {
                const { id } = await params;
                setProjectId(id);

                // Load project and milestone data
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();

                if (!session?.user) {
                    router.push('/sign-in');
                    return;
                }

                // Get project
                const { data: project, error: projectError } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('id', id)
                    .eq('freelancer_id', session.user.id)
                    .single();

                if (projectError || !project) {
                    setError('Proyecto no encontrado');
                    return;
                }

                // Get milestone index from URL or query params (default to 0)
                const queryParams = new URLSearchParams(window.location.search);
                const mIdx = parseInt(queryParams.get('milestone') || '0');
                setMilestoneIndex(mIdx);

                if (project.milestones && project.milestones[mIdx]) {
                    setMilestoneAmount(project.milestones[mIdx].amount);
                } else {
                    setError('Hito no encontrado');
                    return;
                }

                setIsLoading(false);
            } catch (err) {
                console.error('Error loading project:', err);
                setError('Error al cargar los datos del proyecto');
                setIsLoading(false);
            }
        };

        loadProjectData();
    }, [params, router]);

    const handleSubmit = async (invoiceData: any) => {
        setIsSubmitting(true);
        try {
            // Generate PDF URL (for now, we'll use a placeholder)
            const pdfUrl = `/api/invoices/${Date.now()}/pdf`;
            const pdfFilename = `invoice_${invoiceData.invoice_number || 'new'}.pdf`;

            const response = await fetch('/api/freelancer/invoices/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...invoiceData,
                    pdfUrl,
                    pdfFilename,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || data.details?.join(', ') || 'Error al crear la factura');
            }

            alert('¡Factura enviada exitosamente! El administrador la revisará pronto.');
            router.push('/freelancer/invoices');
        } catch (err) {
            alert(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600">Cargando...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
                    <p className="text-red-700">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <InvoiceForm
                projectId={projectId}
                milestoneIndex={milestoneIndex}
                milestoneAmount={milestoneAmount}
                onSubmit={handleSubmit}
                isLoading={isSubmitting}
            />
        </div>
    );
}
