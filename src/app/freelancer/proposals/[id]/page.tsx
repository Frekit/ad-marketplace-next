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
import { Plus, X, ArrowRight, Briefcase, Calendar, Euro } from "lucide-react"

type Milestone = {
    id: string
    name: string
    amount: number
    dueDate: string
    description: string
}

type ProposalDetails = {
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
    status: string
    message?: string
}

export default function ProposalDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [proposal, setProposal] = useState<ProposalDetails | null>(null)

    // Offer form state
    const [coverLetter, setCoverLetter] = useState("")
    const [milestones, setMilestones] = useState<Milestone[]>([
        { id: "1", name: "", amount: 0, dueDate: "", description: "" }
    ])

    useEffect(() => {
        const id = params?.id
        console.log('ProposalDetailsPage - useEffect executing with id:', id)
        if (id) {
            fetchProposalDetails(id)
        } else {
            console.log('No ID found in params:', params)
            setLoading(false)
        }
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

        if (!params?.id) {
            setError("ID de propuesta inválido")
            return
        }

        setSubmitting(true)
        try {
            const res = await fetch(`/api/freelancer/proposals/${params.id}/offer`, {
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

            router.push("/freelancer/proposals?success=true")
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

    const canSubmitOffer = proposal.status === 'pending'

    return (
        <FreelancerLayout>
            <div className="p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Project Details */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl">{proposal.project.title}</CardTitle>
                                    <CardDescription className="mt-2">
                                        De: <span className="font-medium">{proposal.client.name}</span>
                                        {proposal.client.company && ` • ${proposal.client.company}`}
                                    </CardDescription>
                                </div>
                                <Badge className={proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}>
                                    {proposal.status === 'pending' ? 'Pendiente' : proposal.status}
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
                                    {proposal.project.skills_required.map((skill) => (
                                        <Badge key={skill} variant="outline">{skill}</Badge>
                                    ))}
                                </div>
                            </div>

                            {proposal.message && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-semibold mb-2 text-blue-900">Mensaje del Cliente</h4>
                                    <p className="text-blue-800">{proposal.message}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Offer Form */}
                    {canSubmitOffer && (
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

                    {!canSubmitOffer && (
                        <Card className="p-8 text-center">
                            <p className="text-gray-600 mb-4">
                                Esta propuesta ya no está disponible para enviar ofertas.
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
