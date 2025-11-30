import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';
import InvoiceList from '@/components/invoice-list';
import FreelancerLayout from '@/components/layouts/FreelancerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle, HelpCircle } from 'lucide-react';

export default async function FreelancerInvoicesPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'freelancer') {
        redirect('/sign-in');
    }

    const supabase = createClient();

    // Fetch invoices for this freelancer
    const { data: invoices } = await supabase
        .from('invoices')
        .select(`
            *,
            projects:project_id (
                title,
                client_id
            )
        `)
        .eq('freelancer_id', session.user.id)
        .order('created_at', { ascending: false });

    // Fetch user data for billing info
    const { data: userData } = await supabase
        .from('users')
        .select('first_name, last_name, email, tax_id, billing_address, billing_city, billing_postal_code')
        .eq('id', session.user.id)
        .single();

    // Fetch wallet balance
    const { data: walletData } = await supabase
        .from('freelancer_wallets')
        .select('available_balance, total_earned')
        .eq('freelancer_id', session.user.id)
        .single();

    return (
        <FreelancerLayout>
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mis Facturas</h1>
                        <p className="text-gray-600 mt-2">Gestiona tus facturas y datos de billing</p>
                    </div>

                    {/* Billing Data Section */}
                    <Card className="border-2 border-blue-200 bg-blue-50">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <HelpCircle className="h-5 w-5 text-blue-600" />
                                <CardTitle>Datos de Facturación</CardTitle>
                            </div>
                            <CardDescription>
                                Esta es la información que necesitas para crear tus facturas
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Freelancer Info */}
                                <div className="bg-white p-4 rounded-lg border border-blue-100">
                                    <h3 className="font-semibold text-gray-900 mb-3">Tu Información</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-gray-600">Nombre:</span> <span className="font-medium">{userData?.first_name} {userData?.last_name}</span></p>
                                        <p><span className="text-gray-600">Email:</span> <span className="font-medium">{userData?.email}</span></p>
                                        <p><span className="text-gray-600">RFC/NIF:</span> <span className="font-medium">{userData?.tax_id || 'No configurado'}</span></p>
                                        <p><span className="text-gray-600">Dirección:</span> <span className="font-medium">{userData?.billing_address || 'No configurada'}</span></p>
                                        <p><span className="text-gray-600">Ciudad:</span> <span className="font-medium">{userData?.billing_city || 'No configurada'}</span></p>
                                        <p><span className="text-gray-600">CP:</span> <span className="font-medium">{userData?.billing_postal_code || 'No configurado'}</span></p>
                                    </div>
                                </div>

                                {/* Earnings Info */}
                                <div className="bg-white p-4 rounded-lg border border-blue-100">
                                    <h3 className="font-semibold text-gray-900 mb-3">Tus Ganancias</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-gray-600 text-sm mb-1">Base Imponible (Disponible)</p>
                                            <p className="text-2xl font-bold text-blue-600">€{walletData?.available_balance?.toFixed(2) || '0.00'}</p>
                                            <p className="text-xs text-gray-500 mt-1">Este es el monto que debes facturar</p>
                                        </div>
                                        <div className="border-t pt-3">
                                            <p className="text-gray-600 text-sm mb-1">Total Ganado (Histórico)</p>
                                            <p className="text-xl font-semibold text-gray-900">€{walletData?.total_earned?.toFixed(2) || '0.00'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Client Info */}
                            <div className="bg-white p-4 rounded-lg border border-blue-100">
                                <h3 className="font-semibold text-gray-900 mb-3">Cliente (Tu Ordenante)</h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="text-gray-600">Empresa:</span> <span className="font-medium">Malt Ad Marketplace</span></p>
                                    <p><span className="text-gray-600">RFC/NIF:</span> <span className="font-medium">{process.env.NEXT_PUBLIC_PLATFORM_TAX_ID || 'A12345678'}</span></p>
                                    <p><span className="text-gray-600">Dirección:</span> <span className="font-medium">{process.env.NEXT_PUBLIC_PLATFORM_ADDRESS || 'Madrid, ES'}</span></p>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="bg-white p-4 rounded-lg border-l-4 border-l-blue-500">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Cómo Crear tu Factura
                                </h3>
                                <ol className="space-y-2 text-sm text-gray-700 ml-6 list-decimal">
                                    <li>Usa los datos anteriores en tu software de contabilidad o facturación</li>
                                    <li>Base imponible: <strong>€{walletData?.available_balance?.toFixed(2) || '0.00'}</strong></li>
                                    <li>Aplica el IVA (21% en España) o cualquier retención que aplique a tu caso</li>
                                    <li>Incluye tu RFC/NIF y domicilio fiscal</li>
                                    <li>Descarga el PDF de la factura</li>
                                    <li>Sube el PDF en la sección "Subir Factura" abajo</li>
                                    <li>Esperamos su aprobación (típicamente 24-48 horas)</li>
                                    <li>Una vez aprobada, podrás retirar tu dinero</li>
                                </ol>
                            </div>

                            {!userData?.tax_id && (
                                <div className="flex gap-3 items-start bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-yellow-900">Completa tu información fiscal</p>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            Necesitamos tu RFC/NIF y dirección fiscal. Por favor, actualiza tu perfil.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Invoices List */}
                    <div className="bg-white rounded-lg shadow">
                        <InvoiceList initialInvoices={invoices || []} />
                    </div>
                </div>
            </div>
        </FreelancerLayout>
    );
}
