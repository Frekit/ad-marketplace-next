"use client"

import FreelancerLayout from "@/components/layouts/FreelancerLayout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Clock, Euro, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { EmptyProposals } from "@/components/empty-state"

type Proposal = {
    id: string
    project: {
        id: string
        title: string
        description: string
        skills_required: string[]
        created_at: string
    }
    client: {
        name: string
        company?: string
    }
    status: 'pending' | 'accepted' | 'rejected'
    created_at: string
}

export default function FreelancerProposalsPage() {
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [loading, setLoading] = useState(true)
    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'submitted' | 'approved' | 'rejected' | null>(null)

    useEffect(() => {
        fetchProposals()
        fetchVerificationStatus()
    }, [])

    const fetchVerificationStatus = async () => {
        try {
            const res = await fetch('/api/freelancer/verification/status')
            if (res.ok) {
                const data = await res.json()
                setVerificationStatus(data.verification_status)
            }
        } catch (error) {
            console.error('Error fetching verification status:', error)
        }
    }

    const fetchProposals = async () => {
        try {
            const res = await fetch('/api/freelancer/proposals')
            if (res.ok) {
                const data = await res.json()
                setProposals(data.proposals || [])
            }
        } catch (error) {
            console.error('Error fetching proposals:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700',
            accepted: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
        }
        return styles[status as keyof typeof styles] || styles.pending
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <FreelancerLayout>
            <div className="p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Propuestas de Proyecto</h1>
                        <p className="text-gray-600 mt-1">
                            Revisa las invitaciones de clientes y envía tus ofertas
                        </p>
                    </div>

                    {/* Verification Reminder Banner */}
                    {verificationStatus && verificationStatus !== 'approved' && (
                        <Card className="mb-6 border-l-4 border-l-orange-500 bg-orange-50">
                            <div className="p-4 flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-orange-900 mb-1">
                                        Verificación Pendiente
                                    </h3>
                                    <p className="text-sm text-orange-800 mb-3">
                                        {verificationStatus === 'pending' && 'Aún no has iniciado tu verificación. Complétala para poder aceptar trabajos en la plataforma.'}
                                        {verificationStatus === 'submitted' && 'Tu verificación está en revisión. Te notificaremos cuando sea aprobada.'}
                                        {verificationStatus === 'rejected' && 'Tu verificación fue rechazada. Por favor, revisa los requisitos e intenta de nuevo.'}
                                    </p>
                                    <Link href="/freelancer/verification">
                                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                                            Ir a Verificación
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    )}

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5C5C] mx-auto"></div>
                            <p className="text-gray-600 mt-4">Cargando propuestas...</p>
                        </div>
                    ) : proposals.length === 0 ? (
                        <Card>
                            <EmptyProposals />
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {proposals.map((proposal) => (
                                <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        {proposal.project.title}
                                                    </h3>
                                                    <Badge className={getStatusBadge(proposal.status)}>
                                                        {proposal.status === 'pending' ? 'Pendiente' :
                                                            proposal.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    De: <span className="font-medium">{proposal.client.name}</span>
                                                    {proposal.client.company && ` • ${proposal.client.company}`}
                                                </p>
                                            </div>
                                            <div className="text-right text-sm text-gray-500">
                                                <Clock className="h-4 w-4 inline mr-1" />
                                                {formatDate(proposal.created_at)}
                                            </div>
                                        </div>

                                        <p className="text-gray-700 mb-4 line-clamp-2">
                                            {proposal.project.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {proposal.project.skills_required.map((skill) => (
                                                <Badge key={skill} variant="outline" className="text-sm">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>

                                        <div className="flex gap-3">
                                            <Link href={`/freelancer/proposals/${proposal.id}`} className="flex-1">
                                                <Button
                                                    className="w-full bg-[#0F4C5C] hover:bg-[#0F4C5C]/90 text-white"
                                                    disabled={proposal.status !== 'pending'}
                                                >
                                                    {proposal.status === 'pending' ? 'Ver Detalles y Enviar Oferta' : 'Ver Detalles'}
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </FreelancerLayout>
    )
}
