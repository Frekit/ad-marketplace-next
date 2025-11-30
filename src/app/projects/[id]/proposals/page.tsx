"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ClientLayout from "@/components/layouts/ClientLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Calendar, Euro, MessageSquare, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

type Proposal = {
    id: string
    freelancer_id: string
    freelancer: {
        first_name: string
        last_name: string
        email: string
    }
    duration: number
    hourly_rate: number
    total_amount: number
    status: 'pending' | 'negotiating' | 'accepted' | 'rejected'
    milestones: Array<{
        name: string
        description: string
        amount: number
        due_date: string
    }>
    created_at: string
    conversation_id?: string
}

type ProjectData = {
    id: string
    title: string
    description: string
}

export default function ProposalsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [projectId, setProjectId] = useState<string | null>(null)
    const [project, setProject] = useState<ProjectData | null>(null)
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [error, setError] = useState("")

    useEffect(() => {
        const resolveParams = async () => {
            try {
                const resolvedParams = await params
                setProjectId(resolvedParams.id)
            } catch (err) {
                console.error("Error resolving params:", err)
                setError("Error al cargar los parámetros")
                setLoading(false)
            }
        }
        resolveParams()
    }, [params])

    useEffect(() => {
        if (projectId) {
            fetchProject()
            fetchProposals()
        }
    }, [projectId])

    const fetchProject = async () => {
        if (!projectId) {
            setError("ID de proyecto no proporcionado")
            setLoading(false)
            return
        }

        try {
            const res = await fetch(`/api/projects/${projectId}`)
            const data = await res.json()

            if (res.ok) {
                setProject(data.project)
            } else {
                setError(data.error || "No se pudo cargar el proyecto")
            }
        } catch (error) {
            console.error("Error fetching project:", error)
            setError("Error al cargar el proyecto")
        } finally {
            setLoading(false)
        }
    }

    const fetchProposals = async () => {
        if (!projectId) return

        try {
            const res = await fetch(`/api/projects/${projectId}/proposals`)
            const data = await res.json()

            if (res.ok) {
                setProposals(data.proposals || [])
            } else {
                console.error("Error fetching proposals:", data)
            }
        } catch (error) {
            console.error("Error fetching proposals:", error)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-700">Pendiente</Badge>
            case 'negotiating':
                return <Badge className="bg-blue-100 text-blue-700">Negociando</Badge>
            case 'accepted':
                return <Badge className="bg-green-100 text-green-700">Aceptada</Badge>
            case 'rejected':
                return <Badge className="bg-red-100 text-red-700">Rechazada</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    if (loading) {
        return (
            <ClientLayout>
                <div className="p-8 flex justify-center items-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5C5C]"></div>
                </div>
            </ClientLayout>
        )
    }

    if (!project) {
        return (
            <ClientLayout>
                <div className="p-8">
                    <div className="max-w-2xl mx-auto">
                        <Card className="p-8">
                            <div className="text-center">
                                <p className="text-red-600 mb-4 font-medium">Error al cargar el proyecto</p>
                                <p className="text-gray-600 mb-6">{error}</p>
                                <Button onClick={() => router.back()}>Volver</Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </ClientLayout>
        )
    }

    return (
        <ClientLayout>
            <div className="p-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Header */}
                    <div>
                        <Link href={`/projects/${projectId}`} className="text-[#0F4C5C] hover:underline flex items-center gap-1 mb-4">
                            <ArrowLeft className="h-4 w-4" />
                            Volver al proyecto
                        </Link>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Propuestas Recibidas</h1>
                                <p className="text-gray-600 mt-2">{project.title}</p>
                            </div>
                            <Link href={`/projects/${projectId}/invite`}>
                                <Button className="bg-[#0F4C5C] hover:bg-[#0F4C5C]/90 text-white">
                                    Invitar Freelancer
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Proposals List */}
                    {proposals.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <p className="text-gray-600 mb-4">Aún no hay propuestas para este proyecto.</p>
                                <Link href={`/projects/${projectId}/invite`}>
                                    <Button className="bg-[#0F4C5C] hover:bg-[#0F4C5C]/90 text-white">
                                        Invitar a tu primer freelancer
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {proposals.map((proposal) => (
                                <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between gap-6">
                                            {/* Left: Freelancer Info */}
                                            <div className="flex-1 flex items-start gap-4">
                                                <Avatar className="h-12 w-12 mt-1">
                                                    <AvatarFallback className="bg-[#0F4C5C] text-white">
                                                        {proposal.freelancer.first_name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg text-gray-900">
                                                        {proposal.freelancer.first_name} {proposal.freelancer.last_name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">{proposal.freelancer.email}</p>

                                                    {/* Terms Summary */}
                                                    <div className="mt-4 space-y-2">
                                                        <div className="flex items-center gap-6 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                                <span className="text-gray-600">{proposal.duration} días</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Euro className="h-4 w-4 text-gray-400" />
                                                                <span className="text-gray-600">€{proposal.hourly_rate}/hora</span>
                                                            </div>
                                                        </div>

                                                        {/* Milestones preview */}
                                                        {proposal.milestones && proposal.milestones.length > 0 && (
                                                            <div className="mt-3 space-y-1">
                                                                <p className="text-xs font-medium text-gray-700 uppercase">Hitos ({proposal.milestones.length}):</p>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {proposal.milestones.slice(0, 4).map((milestone, idx) => (
                                                                        <div key={idx} className="text-xs bg-gray-50 rounded p-2">
                                                                            <p className="font-medium text-gray-900">{milestone.name}</p>
                                                                            <p className="text-gray-600">€{milestone.amount.toFixed(2)}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Amount and Status */}
                                            <div className="text-right space-y-3">
                                                <div>
                                                    <p className="text-sm text-gray-600">Presupuesto total</p>
                                                    <p className="text-2xl font-bold text-[#0F4C5C]">€{proposal.total_amount.toFixed(2)}</p>
                                                </div>

                                                <div>
                                                    {getStatusBadge(proposal.status)}
                                                </div>

                                                <div className="text-xs text-gray-500">
                                                    {new Date(proposal.created_at).toLocaleDateString('es-ES', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </div>

                                                {/* Actions */}
                                                <div className="space-y-2 pt-4 border-t">
                                                    {proposal.conversation_id && (
                                                        <Link href={`/conversations/${proposal.conversation_id}`}>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full text-[#0F4C5C]"
                                                            >
                                                                <MessageSquare className="h-3 w-3 mr-2" />
                                                                Chat
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={() => router.push(`/projects/${projectId}/proposals/${proposal.id}`)}
                                                    >
                                                        Ver detalles
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ClientLayout>
    )
}
