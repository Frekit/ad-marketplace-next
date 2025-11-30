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
import { Plus, X, ArrowRight, Loader2, ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"

type Milestone = {
    id?: string
    name: string
    description: string
    amount: number
    due_date: string
}

type ProjectProposal = {
    id: string
    duration: number
    hourly_rate: number
    total_amount: number
    milestones: Array<{
        name: string
        description: string
        amount: number
        due_date: string
    }>
}

type ProjectDetails = {
    id: string
    title: string
    description: string
    skills_required?: string[]
}

type ClientDetails = {
    first_name: string
    last_name: string
}

export default function SubmitOfferPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [proposalId, setProposalId] = useState<string | null>(null)
    const [error, setError] = useState("")
    const [proposal, setProposal] = useState<ProjectProposal | null>(null)
    const [project, setProject] = useState<ProjectDetails | null>(null)
    const [client, setClient] = useState<ClientDetails | null>(null)

    // Form state - Counter-offer with different terms
    const [coverLetter, setCoverLetter] = useState("")
    const [duration, setDuration] = useState(7)
    const [hourlyRate, setHourlyRate] = useState(50)
    const [milestones, setMilestones] = useState<Milestone[]>([
        { name: "", description: "", amount: 0, due_date: "" }
    ])

    useEffect(() => {
        const resolveParams = async () => {
            try {
                const resolvedParams = await params
                setProposalId(resolvedParams.id)
            } catch (err) {
                console.error("Error resolving params:", err)
                setError("Error al cargar los parámetros")
                setLoading(false)
            }
        }
        resolveParams()
    }, [params])

    useEffect(() => {
        if (proposalId) {
            fetchProposalDetails()
        }
    }, [proposalId])

    const fetchProposalDetails = async () => {
        if (!proposalId) return

        try {
            const res = await fetch(`/api/freelancer/proposals/${proposalId}/proposal`)
            const data = await res.json()

            if (res.ok) {
                setProposal(data.proposal)
                setProject(data.project)
                setClient(data.client)

                // Pre-fill form with company's proposed terms
                setDuration(data.proposal.duration || 7)
                setHourlyRate(data.proposal.hourly_rate || 50)
                if (data.proposal.milestones && data.proposal.milestones.length > 0) {
                    setMilestones(data.proposal.milestones)
                }
            } else {
                setError(data.error || "No se pudo cargar la propuesta")
            }
        } catch (error) {
            console.error("Error fetching proposal:", error)
            setError("Error al cargar la propuesta")
        } finally {
            setLoading(false)
        }
    }

    const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0)

    const addMilestone = () => {
        setMilestones([
            ...milestones,
            { name: "", description: "", amount: 0, due_date: "" }
        ])
    }

    const removeMilestone = (index: number) => {
        if (milestones.length > 1) {
            setMilestones(milestones.filter((_, i) => i !== index))
        }
    }

    const updateMilestone = (index: number, field: string, value: any) => {
        const updated = [...milestones]
        updated[index] = { ...updated[index], [field]: value }
        setMilestones(updated)
    }

    const handleSubmitOffer = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!proposalId) {
            setError("ID de propuesta inválido")
            return
        }

        if (!coverLetter.trim()) {
            setError("Por favor escribe una carta de presentación")
            return
        }

        if (milestones.some(m => !m.name || !m.due_date || m.amount <= 0)) {
            setError("Todos los hitos deben tener nombre, fecha y monto")
            return
        }

        if (totalAmount <= 0) {
            setError("El monto total debe ser mayor a 0")
            return
        }

        setSubmitting(true)

        try {
            const res = await fetch(`/api/freelancer/proposals/${proposalId}/offer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    coverLetter,
                    milestones: milestones.map(m => ({
                        name: m.name,
                        description: m.description,
                        amount: m.amount,
                        due_date: m.due_date
                    })),
                    totalAmount
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Error al enviar oferta")
            }

            alert("¡Oferta enviada! El cliente recibirá una notificación con tu contraoferta.")
            router.push("/freelancer/proposals")
        } catch (err: any) {
            setError(err.message || "Error al enviar oferta")
        } finally {
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

    if (!proposal || !project) {
        return (
            <FreelancerLayout>
                <div className="p-8">
                    <div className="max-w-2xl mx-auto">
                        <Card className="p-8">
                            <div className="text-center">
                                <p className="text-red-600 mb-4 font-medium">Error al cargar la propuesta</p>
                                <p className="text-gray-600 mb-6">{error}</p>
                                <Button onClick={() => router.back()}>Volver</Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </FreelancerLayout>
        )
    }

    return (
        <FreelancerLayout>
            <div className="p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <div>
                        <Link href={`/freelancer/proposals/${proposalId}`} className="text-[#0F4C5C] hover:underline flex items-center gap-1 mb-4">
                            <ArrowLeft className="h-4 w-4" />
                            Volver a propuesta
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Enviar Contraoferta</h1>
                        <p className="text-gray-600 mt-2">{project.title}</p>
                    </div>

                    {/* Original Proposal Summary */}
                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                            <CardTitle className="text-base">Propuesta Original de {client?.first_name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-gray-600">Duración</p>
                                    <p className="font-semibold">{proposal.duration} días</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Tarifa</p>
                                    <p className="font-semibold">€{proposal.hourly_rate}/hora</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Total</p>
                                    <p className="font-semibold text-[#0F4C5C]">€{proposal.total_amount.toFixed(2)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmitOffer} className="space-y-6">
                        {/* Cover Letter */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tu Mensaje</CardTitle>
                                <CardDescription>Explica por qué propones estos términos</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    placeholder="Hola, creo que puedo hacer este proyecto en menos tiempo... Me gustaría proponer una tarifa de..."
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                    rows={4}
                                    required
                                />
                            </CardContent>
                        </Card>

                        {/* New Terms */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Términos de Tu Contraoferta</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="duration">Duración (días) *</Label>
                                        <Input
                                            id="duration"
                                            type="number"
                                            min="1"
                                            value={duration}
                                            onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="rate">Tarifa horaria (€/hora) *</Label>
                                        <Input
                                            id="rate"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={hourlyRate}
                                            onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-700 font-medium">Presupuesto total:</span>
                                        <span className="text-2xl font-bold text-[#0F4C5C]">€{(duration * hourlyRate).toFixed(2)}</span>
                                    </div>
                                    {proposal.total_amount !== (duration * hourlyRate) && (
                                        <p className="text-xs text-amber-600">
                                            Diferencia: €{Math.abs(proposal.total_amount - (duration * hourlyRate)).toFixed(2)} vs. propuesta original
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Milestones */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Hitos de Tu Contraoferta</CardTitle>
                                    <Button
                                        type="button"
                                        onClick={addMilestone}
                                        variant="outline"
                                        size="sm"
                                        className="text-[#0F4C5C]"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Agregar
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {milestones.map((milestone, index) => (
                                    <div key={index} className="border border-gray-200 rounded p-4 space-y-3">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-medium text-gray-900">Hito {index + 1}</h4>
                                            {milestones.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeMilestone(index)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor={`name-${index}`} className="text-sm">Nombre *</Label>
                                            <Input
                                                id={`name-${index}`}
                                                placeholder="Ej: Diseño inicial"
                                                value={milestone.name}
                                                onChange={(e) => updateMilestone(index, "name", e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor={`desc-${index}`} className="text-sm">Descripción</Label>
                                            <Textarea
                                                id={`desc-${index}`}
                                                placeholder="Qué se espera de este hito..."
                                                value={milestone.description}
                                                onChange={(e) => updateMilestone(index, "description", e.target.value)}
                                                rows={2}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label htmlFor={`amount-${index}`} className="text-sm">Monto (€) *</Label>
                                                <Input
                                                    id={`amount-${index}`}
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={milestone.amount}
                                                    onChange={(e) => updateMilestone(index, "amount", parseFloat(e.target.value) || 0)}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`date-${index}`} className="text-sm">Fecha límite *</Label>
                                                <Input
                                                    id={`date-${index}`}
                                                    type="date"
                                                    value={milestone.due_date}
                                                    onChange={(e) => updateMilestone(index, "due_date", e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700 font-medium">Total de hitos:</span>
                                        <span className="text-xl font-bold text-[#0F4C5C]">€{totalAmount.toFixed(2)}</span>
                                    </div>
                                    {Math.abs(totalAmount - (duration * hourlyRate)) > 0.01 && (
                                        <p className="text-sm text-red-600 mt-2">
                                            ⚠️ El total de hitos no coincide con el presupuesto calculado
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex gap-3 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-[#0F4C5C] hover:bg-[#0F4C5C]/90 text-white"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        Enviar Contraoferta
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </FreelancerLayout>
    )
}
