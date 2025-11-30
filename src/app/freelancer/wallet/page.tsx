"use client"

import { useState, useEffect } from "react"
import FreelancerLayout from "@/components/layouts/FreelancerLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, ArrowDownCircle, Euro, FileText, AlertCircle, CheckCircle, Lock, Unlock } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { SkeletonDashboard } from "@/components/skeleton"
import { EmptyInvoices, EmptyTransactions } from "@/components/empty-state"
import { TransactionTimeline } from "@/components/timeline"

type WalletData = {
    available_balance: number
    total_earned: number
}

type Invoice = {
    id: string
    invoice_number: string
    total_amount: number
    status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'paid'
    issue_date: string
    created_at: string
}

type WithdrawalRequest = {
    id: string
    amount: number
    status: 'pending_invoice' | 'pending_approval' | 'approved' | 'paid' | 'cancelled' | 'failed'
    amount_blocked: number
    base_amount: number
    vat_amount: number
    invoice_expected_by: string
    created_at: string
    approved_at?: string
    paid_at?: string
}

export default function FreelancerWalletPage() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [initiatingWithdrawal, setInitiatingWithdrawal] = useState(false)
    const [cancelllingWithdrawal, setCancellingWithdrawal] = useState(false)
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    const [wallet, setWallet] = useState<WalletData>({ available_balance: 0, total_earned: 0 })
    const [withdrawalAmount, setWithdrawalAmount] = useState("")
    const [withdrawalRequest, setWithdrawalRequest] = useState<WithdrawalRequest | null>(null)
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRequest[]>([])
    const [showInitiateForm, setShowInitiateForm] = useState(false)

    useEffect(() => {
        fetchWallet()
        fetchWithdrawalRequest()
        fetchInvoices()
        fetchWithdrawalHistory()
    }, [])

    const fetchWallet = async () => {
        try {
            const res = await fetch('/api/freelancer/wallet')
            if (res.ok) {
                const data = await res.json()
                setWallet(data.wallet || { available_balance: 0, total_earned: 0 })
            }
        } catch (error) {
            console.error('Error fetching wallet:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchWithdrawalRequest = async () => {
        try {
            const res = await fetch('/api/freelancer/withdrawal/initiate')
            if (res.ok) {
                const data = await res.json()
                setWithdrawalRequest(data.withdrawal_request || null)
            }
        } catch (error) {
            console.error('Error fetching withdrawal request:', error)
        }
    }

    const fetchInvoices = async () => {
        try {
            const res = await fetch('/api/freelancer/invoices')
            if (res.ok) {
                const data = await res.json()
                setInvoices(data.invoices || [])
            }
        } catch (error) {
            console.error('Error fetching invoices:', error)
        }
    }

    const fetchWithdrawalHistory = async () => {
        try {
            const res = await fetch('/api/freelancer/wallet')
            if (res.ok) {
                const data = await res.json()
                setWithdrawalHistory(data.withdrawal_history || [])
            }
        } catch (error) {
            console.error('Error fetching withdrawal history:', error)
        }
    }

    const handleInitiateWithdrawal = async (e: React.FormEvent) => {
        e.preventDefault()

        const amount = parseFloat(withdrawalAmount)

        if (!amount || amount <= 0) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Por favor ingresa un monto válido",
            })
            return
        }

        if (amount < 10) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Monto mínimo de retiro: €10.00",
            })
            return
        }

        if (amount > wallet.available_balance) {
            toast({
                variant: "destructive",
                title: "Error",
                description: `Fondos disponibles: €${wallet.available_balance.toFixed(2)}`,
            })
            return
        }

        setInitiatingWithdrawal(true)

        try {
            const res = await fetch('/api/freelancer/withdrawal/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Error al iniciar retiro')
            }

            toast({
                variant: "success",
                title: "Éxito",
                description: `¡Retiro de €${amount.toFixed(2)} iniciado! Tu dinero está bloqueado. Por favor, crea tu factura.`,
            })
            setWithdrawalAmount("")
            setShowInitiateForm(false)
            await fetchWallet()
            await fetchWithdrawalRequest()
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: err.message,
            })
        } finally {
            setInitiatingWithdrawal(false)
        }
    }

    const handleCancelWithdrawal = async () => {
        if (!withdrawalRequest?.id) return

        setConfirmDialogOpen(true)
    }

    const confirmCancelWithdrawal = async () => {
        if (!withdrawalRequest?.id) return

        setCancellingWithdrawal(true)

        try {
            const res = await fetch('/api/freelancer/withdrawal/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ withdrawal_request_id: withdrawalRequest.id }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Error al cancelar retiro')
            }

            toast({
                variant: "success",
                title: "Éxito",
                description: data.message || 'Retiro cancelado. Dinero desbloqueado.',
            })
            await fetchWallet()
            await fetchWithdrawalRequest()
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: err.message,
            })
        } finally {
            setCancellingWithdrawal(false)
        }
    }

    if (loading) {
        return (
            <FreelancerLayout>
                <div className="p-8">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="space-y-2">
                            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <SkeletonDashboard />
                    </div>
                </div>
            </FreelancerLayout>
        )
    }

    return (
        <FreelancerLayout>
            <div className="p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mi Wallet</h1>
                        <p className="text-gray-600 mt-1">Gestiona tus ganancias y retiros</p>
                    </div>

                    {/* Balance Cards */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Total Ganado
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-blue-600">
                                    €{wallet.total_earned.toFixed(2)}
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    Ganancias históricas
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                    <Lock className="h-4 w-4" />
                                    Bloqueado (Pendiente)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-amber-600">
                                    €{withdrawalRequest ? withdrawalRequest.amount_blocked.toFixed(2) : '0.00'}
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    Esperando factura
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                    <Unlock className="h-4 w-4" />
                                    Disponible (Sin Bloquear)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-green-600">
                                    €{Math.max(0, wallet.available_balance - (withdrawalRequest?.amount_blocked || 0)).toFixed(2)}
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    Para gastar libremente
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Invoice Status Section */}
                    <Card className="border-l-4 border-l-blue-500 bg-blue-50">
                        <CardHeader>
                            <CardTitle className="text-lg">Flujo de Pagos</CardTitle>
                            <CardDescription>Cómo funciona el retiro de dinero</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-semibold">1</div>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Gana Dinero</p>
                                        <p className="text-sm text-gray-600">Completa proyectos y hitos</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-semibold">2</div>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Emite Factura</p>
                                        <p className="text-sm text-gray-600">Crea una factura del monto</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-semibold">3</div>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Retira Dinero</p>
                                        <p className="text-sm text-gray-600">Transferencia a tu IBAN</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded p-4 border border-blue-200">
                                <p className="text-sm text-gray-700">
                                    <strong>Nota:</strong> Solo puedes retirar dinero que haya sido facturado y aprobado.
                                    El dinero sin facturar aparece en "Sin Facturar" y necesita una factura antes de poder retirarlo.
                                </p>
                            </div>

                            {wallet.available_balance > 0 && invoices.filter(inv => inv.status === 'approved').reduce((sum, inv) => sum + inv.total_amount, 0) < wallet.available_balance && (
                                <div className="flex gap-3 items-start bg-yellow-50 border border-yellow-200 rounded p-4">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-yellow-900">Tienes €{(wallet.available_balance - invoices.filter(inv => inv.status === 'approved').reduce((sum, inv) => sum + inv.total_amount, 0)).toFixed(2)} sin facturar</p>
                                        <p className="text-sm text-yellow-800 mt-1">
                                            Ve a la sección de facturas para crear una nueva factura de tus ganancias.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <Link href="/freelancer/invoices" className="block">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Ir a Mis Facturas
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Withdrawal Status and Initiate Section */}
                    {withdrawalRequest && withdrawalRequest.status !== 'cancelled' ? (
                        <Card className="border-l-4 border-l-amber-500 bg-amber-50">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Lock className="h-5 w-5 text-amber-600" />
                                            Retiro en Progreso
                                        </CardTitle>
                                        <CardDescription>
                                            Estado: {withdrawalRequest.status === 'pending_invoice' ? 'Esperando Factura' : withdrawalRequest.status === 'pending_approval' ? 'Factura Subida (Pendiente Aprobación)' : withdrawalRequest.status === 'approved' ? 'Aprobado' : withdrawalRequest.status === 'paid' ? 'Pagado' : 'Fallo'}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={withdrawalRequest.status === 'paid' ? 'default' : withdrawalRequest.status === 'failed' ? 'destructive' : 'secondary'}>
                                        {withdrawalRequest.status === 'pending_invoice' && 'PENDIENTE'}
                                        {withdrawalRequest.status === 'pending_approval' && 'EN REVISIÓN'}
                                        {withdrawalRequest.status === 'approved' && 'APROBADO'}
                                        {withdrawalRequest.status === 'paid' && 'PAGADO'}
                                        {withdrawalRequest.status === 'failed' && 'FALLIDO'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-white rounded p-4 border border-amber-200">
                                        <p className="text-sm text-gray-600 mb-1">Monto Bloqueado</p>
                                        <p className="text-3xl font-bold text-amber-600">€{withdrawalRequest.amount_blocked.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-white rounded p-4 border border-amber-200">
                                        <p className="text-sm text-gray-600 mb-1">Base Imponible + IVA</p>
                                        <p className="text-3xl font-bold text-gray-900">€{(withdrawalRequest.base_amount + withdrawalRequest.vat_amount).toFixed(2)}</p>
                                        <p className="text-xs text-gray-500 mt-1">Base: €{withdrawalRequest.base_amount.toFixed(2)} + IVA 21%: €{withdrawalRequest.vat_amount.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded p-4 border border-amber-200">
                                    <p className="text-sm text-gray-600 mb-1">Fecha Límite para Factura</p>
                                    <p className="font-medium text-gray-900">{new Date(withdrawalRequest.invoice_expected_by).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>

                                {withdrawalRequest.status === 'pending_invoice' && (
                                    <div className="bg-blue-50 border border-blue-200 rounded p-4">
                                        <p className="text-sm font-medium text-blue-900 mb-2">Próximos pasos:</p>
                                        <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
                                            <li>Ve a <Link href="/freelancer/invoices" className="font-medium underline">Mis Facturas</Link></li>
                                            <li>Crea una factura con la base imponible mostrada arriba</li>
                                            <li>Sube el PDF de la factura</li>
                                            <li>Espera aprobación (normalmente 24-48 horas)</li>
                                            <li>Una vez aprobada, tu dinero será transferido automáticamente</li>
                                        </ol>
                                    </div>
                                )}

                                {withdrawalRequest.status !== 'paid' && withdrawalRequest.status !== 'failed' && (
                                    <Button
                                        onClick={handleCancelWithdrawal}
                                        disabled={cancelllingWithdrawal}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        {cancelllingWithdrawal ? 'Cancelando...' : 'Cancelar Retiro (Desbloquear Dinero)'}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Iniciar Nuevo Retiro</CardTitle>
                                <CardDescription>
                                    Bloquea dinero y crea una factura para retirarlo
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!showInitiateForm ? (
                                    <Button
                                        onClick={() => setShowInitiateForm(true)}
                                        className="w-full bg-[#0F4C5C] hover:bg-[#0F4C5C]/90 text-white"
                                    >
                                        <ArrowDownCircle className="h-4 w-4 mr-2" />
                                        Iniciar Retiro
                                    </Button>
                                ) : (
                                    <form onSubmit={handleInitiateWithdrawal} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="withdrawal-amount">Monto a Retirar (€)</Label>
                                            <Input
                                                id="withdrawal-amount"
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={withdrawalAmount}
                                                onChange={(e) => setWithdrawalAmount(e.target.value)}
                                                disabled={initiatingWithdrawal}
                                            />
                                            <p className="text-sm text-gray-500">
                                                Disponible: €{wallet.available_balance.toFixed(2)}
                                            </p>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h4 className="font-medium text-blue-900 mb-2">Cómo funciona:</h4>
                                            <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
                                                <li>Tu dinero será bloqueado inmediatamente</li>
                                                <li>Recibirás datos fiscales para crear tu factura</li>
                                                <li>Crea y sube la factura</li>
                                                <li>Admin aprueba la factura</li>
                                                <li>Pago automático a tu IBAN</li>
                                            </ol>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                type="submit"
                                                disabled={initiatingWithdrawal}
                                                className="flex-1 bg-[#0F4C5C] hover:bg-[#0F4C5C]/90 text-white"
                                            >
                                                {initiatingWithdrawal ? 'Iniciando...' : 'Bloquear Dinero y Continuar'}
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    setShowInitiateForm(false)
                                                    setWithdrawalAmount("")
                                                }}
                                                variant="outline"
                                                disabled={initiatingWithdrawal}
                                            >
                                                Cancelar
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Transaction History Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Transacciones</CardTitle>
                            <CardDescription>
                                {withdrawalHistory.length > 0
                                    ? `${withdrawalHistory.length} retiro${withdrawalHistory.length !== 1 ? 's' : ''} en tu historial`
                                    : 'Tu historial de transacciones aparecerá aquí'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {withdrawalHistory.length > 0 ? (
                                <TransactionTimeline
                                    events={withdrawalHistory.map(wr => ({
                                        id: wr.id,
                                        type: wr.status === 'paid' ? 'completed' : wr.status === 'pending_approval' ? 'pending' : wr.status === 'cancelled' ? 'withdrawn' : 'earned',
                                        amount: wr.amount,
                                        date: new Date(wr.created_at),
                                        description: `Estado: ${
                                            wr.status === 'pending_invoice' ? 'Esperando factura' :
                                            wr.status === 'pending_approval' ? 'Factura en revisión' :
                                            wr.status === 'approved' ? 'Aprobado' :
                                            wr.status === 'paid' ? 'Pagado' :
                                            wr.status === 'cancelled' ? 'Cancelado' :
                                            'Fallido'
                                        }`,
                                        status: wr.status === 'paid' || wr.status === 'approved' ? 'completed' : 'pending'
                                    }))}
                                />
                            ) : (
                                <EmptyTransactions />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Confirmation Dialog for cancelling withdrawal */}
            <ConfirmationDialog
                open={confirmDialogOpen}
                onOpenChange={setConfirmDialogOpen}
                title="Cancelar Retiro"
                description="¿Estás seguro de que quieres cancelar este retiro? El dinero será desbloqueado y podrás utilizarlo nuevamente."
                confirmText="Cancelar Retiro"
                cancelText="Mantener Retiro"
                isDestructive={true}
                onConfirm={confirmCancelWithdrawal}
                isLoading={cancelllingWithdrawal}
            />
        </FreelancerLayout>
    )
}
