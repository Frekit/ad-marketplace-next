"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ClientLayout from "@/components/layouts/ClientLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

type Milestone = {
    id?: string
    name: string
    description: string
    amount: number
    due_date: string
}

type ProjectData = {
    id: string
    title: string
    description: string
    skills_required?: string[]
}

type FreelancerOption = {
    id: string
    first_name: string
    last_name: string
    email: string
    rate?: number
}

export default function InviteFreelancerPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [projectId, setProjectId] = useState<string | null>(null)
    const [project, setProject] = useState<ProjectData | null>(null)
    const [error, setError] = useState("")

    // Form state
    const [freelancerId, setFreelancerId] = useState("")
    const [duration, setDuration] = useState(7)
    const [hourlyRate, setHourlyRate] = useState(50)
    const [milestones, setMilestones] = useState<Milestone[]>([
        { name: "Inicio del Proyecto", description: "", amount: 0, due_date: "" }
    ])
    const [freelancerSearch, setFreelancerSearch] = useState("")
    const [freelancerOptions, setFreelancerOptions] = useState<FreelancerOption[]>([])
    const [showFreelancerList, setShowFreelancerList] = useState(false)
    const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerOption | null>(null)

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
        }
    }, [projectId])

    // Calculate total amount from milestones
    const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0)

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

    const searchFreelancers = async (query: string) => {
        if (query.length < 2) {
            setFreelancerOptions([])
            return
        }

        try {
            const res = await fetch(`/api/freelancers/search?q=${encodeURIComponent(query)}`)
            const data = await res.json()

            if (res.ok) {
                setFreelancerOptions(data.freelancers || [])
            } else {
                setFreelancerOptions([])
            }
        } catch (error) {
            console.error("Error searching freelancers:", error)
            setFreelancerOptions([])
        }
    }

    const handleFreelancerSelect = (freelancer: FreelancerOption) => {
        setSelectedFreelancer(freelancer)
        setFreelancerId(freelancer.id)
        setFreelancerSearch(`${freelancer.first_name} ${freelancer.last_name}`)
        setShowFreelancerList(false)
        // Auto-fill rate if available
        if (freelancer.rate) {
            setHourlyRate(freelancer.rate)
        }
    }

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!projectId || !freelancerId) {
            setError("Por favor selecciona un freelancer")
            return
        }

        if (duration <= 0) {
            setError("La duración debe ser mayor a 0")
            return
        }

        if (hourlyRate <= 0) {
            setError("La tarifa debe ser mayor a 0")
            return
        }

        if (milestones.some(m => !m.name || !m.due_date || m.amount <= 0)) {
            setError("Todos los hitos deben tener nombre, fecha y monto")
            return
        }

        if (Math.abs(totalAmount - (duration * hourlyRate)) > 0.01) {
            setError("El total de los hitos debe ser igual al presupuesto calculado (duración × tarifa)")
            return
        }

        setSubmitting(true)

        try {
            const res = await fetch(`/api/projects/${projectId}/proposals`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    freelancer_id: freelancerId,
                    estimated_days: duration,
                    hourly_rate: hourlyRate,
                    suggested_milestones: milestones.map(m => ({
                        name: m.name,
                        description: m.description,
                        amount: m.amount,
                        due_date: m.due_date
                    }))
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Error al enviar propuesta")
            }

            // Show success and redirect
            toast({ variant: "success", title: "Éxito", description: "¡Propuesta enviada! El freelancer recibirá una notificación." })
            router.push(`/projects/${projectId}`)
        } catch (err: any) {
            setError(err.message || "Error al enviar propuesta")
        } finally {
            setSubmitting(false)
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
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <div>
                        <Link href={`/projects/${projectId}`} className="text-[#0F4C5C] hover:underline flex items-center gap-1 mb-4">
                            <ArrowLeft className="h-4 w-4" />
                            Volver al proyecto
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Invitar a Freelancer</h1>
                        <p className="text-gray-600 mt-2">{project.title}</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Freelancer Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Seleccionar Freelancer</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="freelancer">Buscar freelancer</Label>
                                    <div className="relative mt-2">
                                        <Input
                                            id="freelancer"
                                            placeholder="Escribe nombre o email..."
                                            value={freelancerSearch}
                                            onChange={(e) => {
                                                setFreelancerSearch(e.target.value)
                                                searchFreelancers(e.target.value)
                                                setShowFreelancerList(true)
                                            }}
                                            onFocus={() => setShowFreelancerList(true)}
                                        />
                                        {showFreelancerList && freelancerOptions.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded mt-1 shadow-lg z-10 max-h-48 overflow-y-auto">
                                                {freelancerOptions.map(freelancer => (
                                                    <button
                                                        key={freelancer.id}
                                                        type="button"
                                                        onClick={() => handleFreelancerSelect(freelancer)}
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                                                    >
                                                        <p className="font-medium">{freelancer.first_name} {freelancer.last_name}</p>
                                                        <p className="text-sm text-gray-600">{freelancer.email}</p>
                                                        {freelancer.rate && <p className="text-sm text-[#0F4C5C] font-medium">€{freelancer.rate}/hora</p>}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedFreelancer && (
                                    <div className="bg-blue-50 border border-blue-200 rounded p-4">
                                        <p className="text-sm text-gray-600">Freelancer seleccionado:</p>
                                        <p className="font-medium text-[#0F4C5C]">
                                            {selectedFreelancer.first_name} {selectedFreelancer.last_name}
                                        </p>
                                        <p className="text-sm text-gray-600">{selectedFreelancer.email}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Terms */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Términos de la Propuesta</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="duration">Número de Jornadas</Label>
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
                                        <Label htmlFor="rate">Precio Total (€)</Label>
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
                                        <span className="text-gray-700">Precio Total:</span>
                                        <span className="text-2xl font-bold text-[#0F4C5C]">€{hourlyRate.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Precio por Jornada:</span>
                                        <span className="text-lg font-semibold text-[#0F4C5C]">€{(hourlyRate / duration).toFixed(2)}/jornada</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">({duration} jornadas)</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Milestones */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Hitos</CardTitle>
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
                                <CardDescription>Define los hitos del proyecto. El total debe coincidir con el presupuesto.</CardDescription>
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
                                                    <Trash2 className="h-4 w-4" />
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
                                            ⚠️ El total de hitos (€{totalAmount.toFixed(2)}) no coincide con el presupuesto (€{(duration * hourlyRate).toFixed(2)})
                                        </p>
                                    )}
                                    {Math.abs(totalAmount - (duration * hourlyRate)) <= 0.01 && (
                                        <p className="text-sm text-green-600 mt-2">
                                            ✓ El total de hitos coincide con el presupuesto
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
                                disabled={submitting || !freelancerId}
                                className="bg-[#0F4C5C] hover:bg-[#0F4C5C]/90 text-white"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    "Enviar Propuesta"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </ClientLayout>
    )
}
