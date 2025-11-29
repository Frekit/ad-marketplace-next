"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FreelancerLayout from "@/components/layouts/FreelancerLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckCircle, Clock, Euro, Calendar, Upload } from "lucide-react"

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
    allocated_budget: number
    milestones: Milestone[]
    client: {
        id: string
        name: string
        email: string
    }
}

export default function FreelancerProjectPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [completing, setCompleting] = useState<number | null>(null)
    const [error, setError] = useState("")
    const [project, setProject] = useState<ProjectDetails | null>(null)

    useEffect(() => {
        fetchProject()
    }, [params.id])

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/freelancer/projects/${params.id}`)
            if (res.ok) {
                const data = await res.json()
                setProject(data.project)
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

    const handleCompleteMilestone = async (milestoneIndex: number) => {
        setCompleting(milestoneIndex)
        setError("")

        try {
            const res = await fetch(`/api/freelancer/projects/${params.id}/milestones/${milestoneIndex}/complete`, {
                method: "POST",
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Error al marcar el hito como completado")
            }

            await fetchProject()
            alert("¡Hito marcado como completado! El cliente será notificado para su aprobación.")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setCompleting(null)
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

    if (!project) {
        return (
            <FreelancerLayout>
                <div className="p-8">
                    <Card className="p-8 text-center">
                        <p className="text-red-600 mb-4">{error || "Proyecto no encontrado"}</p>
                        <Button onClick={() => router.push('/freelancer/projects')}>Volver a Proyectos</Button>
                    </Card>
                </div>
            </FreelancerLayout>
        )
    }

    const completedMilestones = project.milestones?.filter(m => m.status === 'approved').length || 0
    const totalMilestones = project.milestones?.length || 0
    const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

    return (
        <FreelancerLayout>
            <div className="p-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Project Header */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl">{project.title}</CardTitle>
                                    <CardDescription className="mt-2">{project.description}</CardDescription>
                                </div>
                                <Badge className={project.status === 'active' ? 'bg-green-100 text-green-700' : ''}>
                                    {project.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-[#FF5C5C] text-white">
                                            {project.client?.name?.charAt(0) || 'C'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{project.client?.name || 'Cliente'}</p>
                                        <p className="text-sm text-gray-500">{project.client?.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Valor Total</p>
                                    <p className="text-2xl font-bold text-[#0F4C5C]">€{project.allocated_budget?.toFixed(2) || '0.00'}</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Progreso del Proyecto</span>
                                    <span className="text-sm text-gray-500">{completedMilestones} / {totalMilestones} hitos aprobados</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-[#0F4C5C] h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Milestones */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Hitos del Proyecto</h2>
                        <div className="space-y-4">
                            {project.milestones?.map((milestone, index) => (
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
                                                        {milestone.status === 'approved' ? 'Aprobado y Pagado' :
                                                            milestone.status === 'completed' ? 'Esperando Aprobación' :
                                                                'En Progreso'}
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
                                                {milestone.status === 'pending' && (
                                                    <Button
                                                        onClick={() => handleCompleteMilestone(index)}
                                                        disabled={completing === index}
                                                        className="bg-[#0F4C5C] hover:bg-[#0F4C5C]/90 text-white"
                                                    >
                                                        {completing === index ? (
                                                            <>Marcando...</>
                                                        ) : (
                                                            <>
                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                Marcar Completado
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                                {milestone.status === 'completed' && (
                                                    <div className="flex items-center gap-2 text-blue-600">
                                                        <Clock className="h-5 w-5" />
                                                        <span className="font-medium">Esperando aprobación</span>
                                                    </div>
                                                )}
                                                {milestone.status === 'approved' && (
                                                    <div className="flex items-center gap-2 text-green-600">
                                                        <CheckCircle className="h-5 w-5" />
                                                        <span className="font-medium">Pagado</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {project.status === 'completed' && (
                        <Card className="bg-green-50 border-green-200">
                            <CardContent className="p-6 text-center">
                                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                                <h3 className="text-xl font-bold text-green-900 mb-2">¡Proyecto Completado!</h3>
                                <p className="text-green-700">
                                    Todos los hitos han sido aprobados y pagados. Los fondos están disponibles en tu wallet.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </FreelancerLayout>
    )
}
