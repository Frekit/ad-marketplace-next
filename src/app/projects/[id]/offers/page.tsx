"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ClientLayout from "@/components/layouts/ClientLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Briefcase, Calendar, Euro, CheckCircle, XCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EmptyState } from "@/components/empty-state"
import { SkeletonCard, SkeletonList } from "@/components/skeleton"

type Milestone = {
    id: string
    name: string
    amount: number
    dueDate: string
    description: string
}

type Offer = {
    id: string
    freelancer: {
        id: string
        name: string
        email: string
    }
    cover_letter: string
    milestones: Milestone[]
    total_amount: number
    status: string
    created_at: string
}

type ProjectDetails = {
    id: string
    title: string
    description: string
    skills_required: string[]
    status: string
    created_at: string
}

export default function ProjectOffersPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [accepting, setAccepting] = useState<string | null>(null)
    const [error, setError] = useState("")
    const [project, setProject] = useState<ProjectDetails | null>(null)
    const [offers, setOffers] = useState<Offer[]>([])
    const [walletBalance, setWalletBalance] = useState(0)

    useEffect(() => {
        fetchProjectAndOffers()
        fetchWalletBalance()
    }, [params.id])

    const fetchProjectAndOffers = async () => {
        try {
            const res = await fetch(`/api/projects/${params.id}/offers`)
            if (res.ok) {
                const data = await res.json()
                setProject(data.project)
                setOffers(data.offers || [])
            } else {
                setError("No se pudo cargar el proyecto")
            }
        } catch (error) {
            console.error('Error fetching project:', error)
            setError("Error al cargar el proyecto")
        } finally {
            setLoading(false)
        }
    }

    const fetchWalletBalance = async () => {
        try {
            const res = await fetch('/api/wallet/balance')
            if (res.ok) {
                const data = await res.json()
                setWalletBalance(data.available_balance || 0)
            }
        } catch (error) {
            console.error('Error fetching balance:', error)
        }
    }

    const handleAcceptOffer = async (offerId: string, totalAmount: number) => {
        if (walletBalance < totalAmount) {
            setError(`Fondos insuficientes. Necesitas €${totalAmount.toFixed(2)} pero solo tienes €${walletBalance.toFixed(2)}. Por favor, añade fondos a tu wallet.`)
            return
        }

        setAccepting(offerId)
        setError("")

        try {
            const res = await fetch(`/api/projects/${params.id}/offers/${offerId}/accept`, {
                method: "POST",
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Error al aceptar la oferta")
            }

            // Refresh data
            await fetchProjectAndOffers()
            await fetchWalletBalance()

            toast({ variant: "success", title: "Éxito", description: "¡Oferta aceptada! Los fondos han sido bloqueados en escrow." })
        } catch (err: any) {
            setError(err.message)
        } finally {
            setAccepting(null)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    if (loading) {
        return (
            <ClientLayout>
                <div className="p-8">
                    <div className="max-w-6xl mx-auto space-y-6">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1 space-y-4">
                                <SkeletonCard />
                            </div>
                        </div>
                        <SkeletonCard />
                        <SkeletonList count={3} />
                    </div>
                </div>
            </ClientLayout>
        )
    }

    if (error && !project) {
        return (
            <ClientLayout>
                <div className="p-8">
                    <div className="max-w-3xl mx-auto">
                        <Card className="p-8 text-center">
                            <p className="text-red-600 mb-4">{error}</p>
                            <Button onClick={() => router.back()}>Volver</Button>
                        </Card>
                    </div>
                </div>
            </ClientLayout>
        )
    }

    if (!project) return null

    return (
        <ClientLayout>
            <div className="p-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Project Header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                            <p className="text-gray-600 mt-2">{project.description}</p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {project.skills_required.map((skill) => (
                                    <Badge key={skill} variant="outline">{skill}</Badge>
                                ))}
                            </div>
                        </div>
                        <Badge className={project.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                            {project.status === 'draft' ? 'Borrador' : project.status}
                        </Badge>
                    </div>

                    {/* Wallet Balance Warning */}
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="font-medium text-blue-900">Balance Disponible en Wallet</p>
                                <p className="text-sm text-blue-700">Los fondos se bloquearán al aceptar una oferta</p>
                            </div>
                            <div className="text-2xl font-bold text-blue-900">€{walletBalance.toFixed(2)}</div>
                        </CardContent>
                    </Card>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Offers List */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Ofertas Recibidas ({offers.length})
                        </h2>

                        {offers.length === 0 ? (
                            <Card>
                                <EmptyState
                                    icon={Briefcase}
                                    title="Aún no hay ofertas"
                                    description="Cuando los freelancers envíen sus ofertas, aparecerán aquí para que las revises."
                                />
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                {offers.map((offer) => (
                                    <Card key={offer.id} className="overflow-hidden">
                                        <CardHeader className="bg-gray-50">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-12 w-12">
                                                        <AvatarFallback className="bg-[#0F4C5C] text-white">
                                                            {offer.freelancer.name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <CardTitle>{offer.freelancer.name}</CardTitle>
                                                        <CardDescription>{offer.freelancer.email}</CardDescription>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-[#0F4C5C]">
                                                        €{offer.total_amount.toFixed(2)}
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        {formatDate(offer.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-6">
                                            {/* Cover Letter */}
                                            <div>
                                                <h4 className="font-semibold mb-2">Carta de Presentación</h4>
                                                <p className="text-gray-700 whitespace-pre-wrap">{offer.cover_letter}</p>
                                            </div>

                                            {/* Milestones */}
                                            <div>
                                                <h4 className="font-semibold mb-3">Hitos Propuestos ({offer.milestones.length})</h4>
                                                <div className="space-y-3">
                                                    {offer.milestones.map((milestone, index) => (
                                                        <Card key={milestone.id} className="p-4 bg-gray-50">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="font-semibold">Hito {index + 1}:</span>
                                                                        <span>{milestone.name}</span>
                                                                    </div>
                                                                    {milestone.description && (
                                                                        <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                                                                    )}
                                                                </div>
                                                                <div className="text-right ml-4">
                                                                    <div className="font-bold text-[#0F4C5C]">€{milestone.amount.toFixed(2)}</div>
                                                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                                                        <Calendar className="h-3 w-3" />
                                                                        {formatDate(milestone.dueDate)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-3 pt-4 border-t">
                                                {offer.status === 'pending' ? (
                                                    <>
                                                        <Button
                                                            onClick={() => handleAcceptOffer(offer.id, offer.total_amount)}
                                                            disabled={accepting === offer.id}
                                                            className="bg-[#0F4C5C] hover:bg-[#0F4C5C]/90 text-white flex-1"
                                                        >
                                                            {accepting === offer.id ? (
                                                                <>Aceptando...</>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                                    Aceptar Oferta y Bloquear €{offer.total_amount.toFixed(2)}
                                                                </>
                                                            )}
                                                        </Button>
                                                        <Button variant="outline" className="flex-1">
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Rechazar
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Badge className="bg-green-100 text-green-700 px-4 py-2">
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Oferta Aceptada
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ClientLayout>
    )
}
