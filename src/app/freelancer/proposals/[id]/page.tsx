"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FreelancerLayout from "@/components/layouts/FreelancerLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, X, ArrowRight, Briefcase, Calendar, Euro, MessageSquare, CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

type Milestone = {
    id: string
    name: string
    amount: number
    dueDate: string
    description: string
}

type Proposal = {
    id: string
    project_id: string
    freelancer_id: string
    client_id: string
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

type ProjectDetails = {
    id: string
    title: string
    description: string
    skills_required: string[]
}

type ClientDetails = {
    id: string
    first_name: string
    last_name: string
    email: string
}

type ProposalDetails = {
    id: string
    proposal: Proposal
    project: ProjectDetails
    client: ClientDetails
}

export default function ProposalDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [proposal, setProposal] = useState<ProposalDetails | null>(null)
    const [showOfferForm, setShowOfferForm] = useState(false)
    const [action, setAction] = useState<'accept' | 'negotiate' | 'reject' | null>(null)

    // Offer form state
    const [coverLetter, setCoverLetter] = useState("")
    const [milestones, setMilestones] = useState<Milestone[]>([
        { id: "1", name: "", amount: 0, dueDate: "", description: "" }
    ])

    useEffect(() => {
        const resolveParams = async () => {
            const resolvedParams = await params
            const id = resolvedParams?.id
            console.log('ProposalDetailsPage - useEffect executing with id:', id)
            if (id) {
                fetchProposalDetails(id)
            } else {
                console.log('No ID found in params:', resolvedParams)
                setLoading(false)
            }
        }
        resolveParams()
    }, [params])

    const fetchProposalDetails = async (id: string) => {
        if (!id) {
            setError("ID de propuesta inválido")
            setLoading(false)
            return
        }
        try {
            const res = await fetch(`/api/freelancer/proposals/${id}`)
            const data = await res.json()

            if (res.ok) {
                setProposal(data.proposal)
            } else {
                console.error('API Error:', res.status, data)
                setError(`No se pudo cargar la propuesta: ${data.error || 'Error desconocido'} ${data.details ? `- ${data.details}` : ''}`)
            }
        } catch (error) {
            console.error('Error fetching proposal:', error)
            setError("Error al cargar la propuesta: " + (error instanceof Error ? error.message : String(error)))
        } finally {
            setLoading(false)
        }
    }

    const addMilestone = () => {
        setMilestones([
            ...milestones,
            { id: Date.now().toString(), name: "", amount: 0, dueDate: "", description: "" }
        ])
    }

    const removeMilestone = (id: string) => {
        if (milestones.length > 1) {
            setMilestones(milestones.filter(m => m.id !== id))
        }
    }

    const updateMilestone = (id: string, field: keyof Milestone, value: string | number) => {
        setMilestones(milestones.map(m =>
            m.id === id ? { ...m, [field]: value } : m
        ))
    }

    const totalAmount = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0)

    const handleRejectProposal = async () => {
        if (!proposal) return
        setSubmitting(true)
        setError("")

        try {
            const res = await fetch(`/api/project-proposals/${proposal.proposal.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "rejected" })
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || "Error al rechazar propuesta")
            }

            alert("Propuesta rechazada.")
            router.push("/freelancer/proposals")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleAcceptProposal = async () => {
        if (!proposal) return
        setSubmitting(true)
        setError("")

        try {
            // Accept the proposal and submit an offer using the same terms
            const res = await fetch(`/api/freelancer/proposals/${proposal.proposal.id}/offer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    coverLetter: `Acepto los términos propuestos para este proyecto.`,
                    milestones: proposal.proposal.milestones.map(m => ({
                        name: m.name,
                        description: m.description,
                        amount: m.amount,
                        due_date: m.due_date
                    })),
                    totalAmount: proposal.proposal.total_amount,
                    based_on_proposal_id: proposal.proposal.id
                })
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || "Error al aceptar propuesta")
            }

            alert("¡Propuesta aceptada! El cliente recibirá una notificación.")
            router.push("/freelancer/proposals")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleNegotiateProposal = () => {
        if (!proposal?.proposal.conversation_id) {
            setError("Error: No hay conversación disponible para negociar")
            return
        }
        router.push(`/conversations/${proposal.proposal.conversation_id}`)
    }

    const handleSubmitOffer = async () => {
        setError("")

        // Validation
        if (!coverLetter.trim()) {
            setError("Por favor escribe una carta de presentación")
            return
        }

        if (milestones.some(m => !m.name || !m.amount || !m.dueDate)) {
            setError("Por favor completa todos los hitos")
            return
        }

        if (totalAmount <= 0) {
            setError("El monto total debe ser mayor a 0")
            return
        }

        const resolvedParams = await params
        if (!resolvedParams?.id) {
            setError("ID de propuesta inválido")
            return
        }

        setSubmitting(true)
        try {
            const res = await fetch(`/api/freelancer/proposals/${resolvedParams.id}/offer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    coverLetter,
                    milestones,
                    totalAmount,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Error al enviar la oferta")
            }

            alert("¡Oferta enviada! El cliente recibirá una notificación.")
            router.push("/freelancer/proposals")
        } catch (err: any) {
            setError(err.message)
            setSubmitting(false)
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

    if (error && !proposal) {
        return (
            <FreelancerLayout>
                <div className="p-8">
                    <div className="max-w-3xl mx-auto">
                        <Card className="p-8 text-center">
                            <p className="text-red-600 mb-4">{error}</p>
                            <Button onClick={() => router.back()}>Volver</Button>
                        </Card>
                    </div>
                </div>
            </FreelancerLayout>
        )
    }

    if (!proposal) return null

    const proposalStatus = proposal.proposal.status
    const isProposalActive = proposalStatus === 'pending'

    return (
        <FreelancerLayout>
            <div className="p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Back Link */}
                    <Link href="/freelancer/proposals" className="text-[#0F4C5C] hover:underline flex items-center gap-1">
                        <ArrowLeft className="h-4 w-4" />
                        Volver a propuestas
                    </Link>

                    {/* Project Details */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl">{proposal.project.title}</CardTitle>
                                    <CardDescription className="mt-2">
                                        De: <span className="font-medium">{proposal.client.first_name} {proposal.client.last_name}</span>
                                    </CardDescription>
                                </div>
                                <Badge className={
                                    proposalStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    proposalStatus === 'negotiating' ? 'bg-blue-100 text-blue-700' :
                                    proposalStatus === 'accepted' ? 'bg-green-100 text-green-700' :
                                    'bg-red-100 text-red-700'
                                }>
                                    {proposalStatus === 'pending' ? 'Pendiente' :
                                     proposalStatus === 'negotiating' ? 'Negociando' :
                                     proposalStatus === 'accepted' ? 'Aceptada' :
                                     'Rechazada'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Descripción del Proyecto</h4>
                                <p className="text-gray-700 whitespace-pre-wrap">{proposal.project.description}</p>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Habilidades Requeridas</h4>
                                <div className="flex flex-wrap gap-2">
                                    {proposal.project.skills_required && proposal.project.skills_required.map((skill) => (
                                        <Badge key={skill} variant="outline">{skill}</Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Proposal Terms */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Términos Propuestos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Duración</p>
                                    <p className="font-semibold text-lg flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        {proposal.proposal.duration} días
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Tarifa Horaria</p>
                                    <p className="font-semibold text-lg flex items-center gap-2">
                                        <Euro className="h-4 w-4 text-gray-400" />
                                        €{proposal.proposal.hourly_rate}/hora
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total</p>
                                    <p className="font-semibold text-lg text-[#0F4C5C]">€{proposal.proposal.total_amount.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Milestones */}
                            {proposal.proposal.milestones && proposal.proposal.milestones.length > 0 && (
                                <div className="border-t pt-4 mt-4">
                                    <h4 className="font-semibold mb-3">Hitos</h4>
                                    <div className="space-y-3">
                                        {proposal.proposal.milestones.map((milestone, idx) => (
                                            <div key={idx} className="bg-gray-50 rounded p-3 border border-gray-200">
                                                <div className="flex items-start justify-between mb-2">
                                                    <p className="font-medium text-gray-900">{milestone.name}</p>
                                                    <p className="font-semibold text-[#0F4C5C]">€{milestone.amount.toFixed(2)}</p>
                                                </div>
                                                {milestone.description && (
                                                    <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                                                )}
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(milestone.due_date).toLocaleDateString('es-ES')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Action Buttons - Only if proposal is active */}
                    {isProposalActive && !showOfferForm && (
                        <Card className="border-2 border-[#0F4C5C]">
                            <CardHeader>
                                <CardTitle className="text-lg">¿Qué deseas hacer?</CardTitle>
                                <CardDescription>Tienes tres opciones para responder a esta propuesta</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Accept Option */}
                                    <button
                                        onClick={handleAcceptProposal}
                                        disabled={submitting}
                                        className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors flex flex-col items-center gap-2 text-center"
                                    >
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                        <span className="font-semibold text-green-900">Aceptar</span>
                                        <span className="text-xs text-green-700">Acepta los términos tal como están</span>
                                        {submitting && <span className="text-xs text-gray-500">Procesando...</span>}
                                    </button>

                                    {/* Negotiate Option */}
                                    <button
                                        onClick={handleNegotiateProposal}
                                        className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex flex-col items-center gap-2 text-center"
                                    >
                                        <MessageSquare className="h-8 w-8 text-blue-600" />
                                        <span className="font-semibold text-blue-900">Negociar</span>
                                        <span className="text-xs text-blue-700">Discute términos en el chat</span>
                                    </button>

                                    {/* Reject Option */}
                                    <button
                                        onClick={handleRejectProposal}
                                        disabled={submitting}
                                        className="p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors flex flex-col items-center gap-2 text-center"
                                    >
                                        <XCircle className="h-8 w-8 text-red-600" />
                                        <span className="font-semibold text-red-900">Rechazar</span>
                                        <span className="text-xs text-red-700">No estoy interesado</span>
                                        {submitting && <span className="text-xs text-gray-500">Procesando...</span>}
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Offer Form */}
                    {showOfferForm && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Enviar Tu Oferta</CardTitle>
                                <CardDescription>
                                    Define tus hitos y precios para este proyecto
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="coverLetter">Carta de Presentación *</Label>
                                    <Textarea
                                        id="coverLetter"
                                        placeholder="Explica por qué eres el candidato ideal para este proyecto, tu experiencia relevante, y cómo planeas abordarlo..."
                                        value={coverLetter}
                                        onChange={(e) => setCoverLetter(e.target.value)}
                                        rows={6}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-lg">Hitos del Proyecto *</Label>
                                        <Button type="button" onClick={addMilestone} variant="outline" size="sm">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Añadir Hito
                                        </Button>
                                    </div>

                                    {milestones.map((milestone, index) => (
                                        <Card key={milestone.id} className="p-4">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold">Hito {index + 1}</h4>
                                                    {milestones.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            onClick={() => removeMilestone(milestone.id)}
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Nombre del Hito</Label>
                                                        <Input
                                                            placeholder="ej. Investigación y Estrategia"
                                                            value={milestone.name}
                                                            onChange={(e) => updateMilestone(milestone.id, 'name', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Monto (€)</Label>
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            value={milestone.amount || ''}
                                                            onChange={(e) => updateMilestone(milestone.id, 'amount', parseFloat(e.target.value) || 0)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Fecha de Entrega</Label>
                                                    <Input
                                                        type="date"
                                                        value={milestone.dueDate}
                                                        onChange={(e) => updateMilestone(milestone.id, 'dueDate', e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Descripción</Label>
                                                    <Textarea
                                                        placeholder="Describe qué incluye este hito..."
                                                        value={milestone.description}
                                                        onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                                                        rows={2}
                                                    />
                                                </div>
                                            </div>
                                        </Card>
                                    ))}

                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-lg">Total del Proyecto:</span>
                                            <span className="text-2xl font-bold text-[#0F4C5C]">€{totalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => router.back()}
                                        disabled={submitting}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleSubmitOffer}
                                        disabled={submitting}
                                        className="bg-[#0F4C5C] hover:bg-[#0F4C5C]/90 text-white flex-1"
                                    >
                                        {submitting ? "Enviando..." : "Enviar Oferta"}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!isProposalActive && (
                        <Card className="p-8 text-center">
                            <p className="text-gray-600 mb-4">
                                Esta propuesta ya ha sido {proposalStatus === 'rejected' ? 'rechazada' : 'procesada'}.
                            </p>
                            <Button onClick={() => router.push('/freelancer/proposals')}>
                                Volver a Propuestas
                            </Button>
                        </Card>
                    )}
                </div>
            </div>
        </FreelancerLayout>
    )
}
