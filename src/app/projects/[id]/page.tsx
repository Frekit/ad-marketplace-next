"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ClientLayout from "@/components/layouts/ClientLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckCircle, Clock, Euro, Calendar, Edit2, Sparkles, Loader2 } from "lucide-react"
import AIMatchResults from "@/components/ai-match-results"

type Milestone = {
    id: number
    name: string
    amount: number
    due_date: string
    description: string
    status: 'pending' | 'completed' | 'approved'
}

type ProjectDetails = {
    id: string
    title: string
    description: string
    status: string
    allocated_budget?: number
    spent_amount?: number
    skills_required?: string[]
    milestones?: Milestone[]
    freelancer?: {
        id?: string
        name?: string
        email?: string
    }
    freelancer_id?: string
    client_id?: string
}

export default function ProjectManagementPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [approving, setApproving] = useState<number | null>(null)
    const [error, setError] = useState("")
    const [project, setProject] = useState<ProjectDetails | null>(null)
    const [projectId, setProjectId] = useState<string | null>(null)
    const [showAIMatches, setShowAIMatches] = useState(false)
    const [aiMatches, setAIMatches] = useState<any[]>([])
    const [loadingMatches, setLoadingMatches] = useState(false)

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
            console.log('Loading project:', projectId)
            fetchProject()
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
                console.log('Project data:', data)
                setProject(data.project)
            } else {
                console.error('Error response:', data)
                setError(data.error || "No se pudo cargar el proyecto")
            }
        } catch (error) {
            console.error('Error fetching project:', error)
            setError("Error al cargar el proyecto: " + (error instanceof Error ? error.message : String(error)))
        } finally {
            setLoading(false)
        }
    }

    const handleApproveMilestone = async (milestoneIndex: number) => {
        setApproving(milestoneIndex)
        setError("")

        try {
            const res = await fetch(`/api/projects/${projectId}/milestones/${milestoneIndex}/approve`, {
                method: "POST",
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Error al aprobar el hito")
            }

            await fetchProject()
            alert("¡Hito aprobado! Los fondos han sido transferidos al freelancer.")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setApproving(null)
        }
    }

    const handleFindMatches = async () => {
        setLoadingMatches(true)
        setError("")

        try {
            const res = await fetch(`/api/projects/${projectId}/ai-match?limit=5&min_score=0.6`)
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Error al buscar matches")
            }

            setAIMatches(data.matches || [])
            setShowAIMatches(true)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoadingMatches(false)
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
                                <p className="text-gray-600 mb-6">{error || "Proyecto no encontrado"}</p>
                                <div className="flex gap-3 justify-center">
                                    <Button variant="outline" onClick={() => router.back()}>
                                        Volver
                                    </Button>
                                    <Button onClick={() => router.push('/projects')}>
                                        Ir a Mis Proyectos
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </ClientLayout>
        )
    }

    const completedMilestones = project.milestones?.filter(m => m.status === 'approved').length || 0
    const totalMilestones = project.milestones?.length || 0
    const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

    return (
        <ClientLayout>
            <div className="p-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Header Section */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <Card>
                            <CardContent className="p-6">
                                <p className="text-sm text-gray-600 mb-2">Estado</p>
                                <Badge className={project.status === 'draft' ? 'bg-gray-100 text-gray-700' : project.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                                    {project.status === 'draft' ? 'Borrador' : project.status === 'in_progress' ? 'En Progreso' : 'Completado'}
                                </Badge>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <p className="text-sm text-gray-600 mb-2">Presupuesto Asignado</p>
                                <p className="text-2xl font-bold text-[#0F4C5C]">
                                    €{project.allocated_budget?.toFixed(2) || '0.00'}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <p className="text-sm text-gray-600 mb-2">Gastado</p>
                                <p className="text-2xl font-bold text-red-600">
                                    €{project.spent_amount?.toFixed(2) || '0.00'}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <p className="text-sm text-gray-600 mb-2">Disponible</p>
                                <p className="text-2xl font-bold text-green-600">
                                    €{((project.allocated_budget || 0) - (project.spent_amount || 0)).toFixed(2)}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-2xl">{project.title}</CardTitle>
                                    <CardDescription className="mt-2">{project.description}</CardDescription>
                                </div>
                                <Link href={`/projects/${projectId}/edit`}>
                                    <Button variant="outline" size="sm" className="ml-4">
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Editar
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {project.skills_required && project.skills_required.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Habilidades Requeridas:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {project.skills_required.map((skill, idx) => (
                                            <Badge key={idx} variant="outline">{skill}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {project.freelancer ? (
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-[#0F4C5C] text-white">
                                                {project.freelancer?.email?.charAt(0) || 'F'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{project.freelancer?.email || 'Freelancer'}</p>
                                            <p className="text-sm text-gray-500">Freelancer Asignado</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-blue-50 border border-blue-200 rounded p-4 mt-4">
                                    <p className="text-blue-900 font-medium">Este proyecto aún no tiene un freelancer asignado.</p>
                                    <p className="text-blue-700 text-sm mt-1">Invita freelancers para que envíen sus propuestas.</p>
                                    <Button
                                        onClick={handleFindMatches}
                                        disabled={loadingMatches}
                                        className="mt-3 bg-[#FF5C5C] hover:bg-[#FF5C5C]/90 text-white"
                                    >
                                        {loadingMatches ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Buscando...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-4 w-4 mr-2" />
                                                Encontrar Mejores Matches con IA
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}

                            {/* Progress Bar */}
                            {totalMilestones > 0 && (
                                <div className="pt-4 border-t">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Progreso del Proyecto</span>
                                        <span className="text-sm text-gray-500">{completedMilestones} / {totalMilestones} hitos completados</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-[#0F4C5C] h-3 rounded-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* AI Matches Section */}
                    {showAIMatches && (
                        <AIMatchResults
                            matches={aiMatches}
                            onClose={() => setShowAIMatches(false)}
                        />
                    )}

                    {/* Milestones */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Hitos del Proyecto</h2>
                        {project.milestones && project.milestones.length > 0 ? (
                            <div className="space-y-4">
                                {project.milestones.map((milestone, index) => (
                                    <Card key={milestone.id || index}>
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-semibold">Hito {index + 1}: {milestone.name}</h3>
                                                        <Badge className={
                                                            milestone.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                                milestone.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                        }>
                                                            {milestone.status === 'approved' ? 'Aprobado' :
                                                                milestone.status === 'completed' ? 'Completado - Pendiente de Aprobación' :
                                                                    'Pendiente'}
                                                        </Badge>
                                                    </div>
                                                    {milestone.description && (
                                                        <p className="text-gray-600 mb-3">{milestone.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(milestone.due_date).toLocaleDateString('es-ES')}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Euro className="h-4 w-4" />
                                                            €{milestone.amount.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    {milestone.status === 'completed' && (
                                                        <Button
                                                            onClick={() => handleApproveMilestone(index)}
                                                            disabled={approving === index}
                                                            className="bg-[#0F4C5C] hover:bg-[#0F4C5C]/90 text-white"
                                                        >
                                                            {approving === index ? (
                                                                <>Aprobando...</>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                                    Aprobar y Pagar
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                    {milestone.status === 'approved' && (
                                                        <div className="flex items-center gap-2 text-green-600">
                                                            <CheckCircle className="h-5 w-5" />
                                                            <span className="font-medium">Pagado</span>
                                                        </div>
                                                    )}
                                                    {milestone.status === 'pending' && (
                                                        <div className="flex items-center gap-2 text-gray-400">
                                                            <Clock className="h-5 w-5" />
                                                            <span>En progreso</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="p-6 text-center text-gray-500">
                                    <p>No hay hitos asociados a este proyecto aún.</p>
                                    <p className="text-sm mt-1">Los hitos se crearán cuando aceptes una propuesta de freelancer.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </ClientLayout>
    )
}
