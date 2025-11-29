"use client"

import { useState, useEffect } from "react"
import FreelancerLayout from "@/components/layouts/FreelancerLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, ArrowDownCircle, Euro } from "lucide-react"

type WalletData = {
    available_balance: number
    total_earned: number
}

export default function FreelancerWalletPage() {
    const [loading, setLoading] = useState(true)
    const [withdrawing, setWithdrawing] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [wallet, setWallet] = useState<WalletData>({ available_balance: 0, total_earned: 0 })
    const [withdrawAmount, setWithdrawAmount] = useState("")
    const [iban, setIban] = useState("")

    useEffect(() => {
        fetchWallet()
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

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        const amount = parseFloat(withdrawAmount)

        if (!amount || amount <= 0) {
            setError("Por favor ingresa un monto válido")
            return
        }

        if (amount > wallet.available_balance) {
            setError(`Fondos insuficientes. Disponible: €${wallet.available_balance.toFixed(2)}`)
            return
        }

        if (!iban || iban.length < 15) {
            setError("Por favor ingresa un IBAN válido")
            return
        }

        setWithdrawing(true)

        try {
            const res = await fetch('/api/freelancer/wallet/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, iban }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Error al procesar el retiro')
            }

            setSuccess(`¡Retiro de €${amount.toFixed(2)} procesado! Los fondos llegarán a tu cuenta en 1-3 días hábiles.`)
            setWithdrawAmount("")
            setIban("")
            await fetchWallet()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setWithdrawing(false)
        }
    }

    if (loading) {
        return (
            <FreelancerLayout>
                <div className="p-8 flex justify-center items-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5C5C]"></div>
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
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                    <Wallet className="h-4 w-4" />
                                    Fondos Disponibles
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-green-600">
                                    €{wallet.available_balance.toFixed(2)}
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    Disponible para retirar
                                </p>
                            </CardContent>
                        </Card>

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
                                    Ganancias totales históricas
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Withdrawal Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Retirar Fondos (SEPA)</CardTitle>
                            <CardDescription>
                                Transfiere tus ganancias a tu cuenta bancaria
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleWithdraw} className="space-y-4">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                                        {success}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="amount">Monto a Retirar (€)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        disabled={withdrawing}
                                    />
                                    <p className="text-sm text-gray-500">
                                        Disponible: €{wallet.available_balance.toFixed(2)}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="iban">IBAN de tu Cuenta Bancaria</Label>
                                    <Input
                                        id="iban"
                                        type="text"
                                        placeholder="ES00 0000 0000 0000 0000 0000"
                                        value={iban}
                                        onChange={(e) => setIban(e.target.value.toUpperCase())}
                                        disabled={withdrawing}
                                    />
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-medium text-blue-900 mb-2">ℹ️ Información sobre Retiros</h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Los retiros se procesan mediante transferencia SEPA</li>
                                        <li>• Los fondos llegarán a tu cuenta en 1-3 días hábiles</li>
                                        <li>• No hay comisiones por retiro</li>
                                        <li>• Monto mínimo de retiro: €10.00</li>
                                    </ul>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={withdrawing || wallet.available_balance === 0}
                                    className="w-full bg-[#0F4C5C] hover:bg-[#0F4C5C]/90 text-white"
                                >
                                    {withdrawing ? (
                                        <>Procesando...</>
                                    ) : (
                                        <>
                                            <ArrowDownCircle className="h-4 w-4 mr-2" />
                                            Retirar Fondos
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </FreelancerLayout>
    )
}
