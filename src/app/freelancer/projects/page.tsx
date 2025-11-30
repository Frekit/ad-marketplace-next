"use client"

import FreelancerLayout from "@/components/layouts/FreelancerLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, Calendar, DollarSign, Briefcase, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { EmptyProjects } from "@/components/empty-state"
import { SkeletonList } from "@/components/skeleton"

type Project = {
    id: string;
    title: string;
    description?: string;
    allocated_budget: number;
    status: string;
    created_at: string;
    deadline?: string;
    client_id: string;
}

export default function FreelancerProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'submitted' | 'approved' | 'rejected' | null>(null)

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch("/api/freelancer/projects")
                if (res.ok) {
                    const data = await res.json()
                    setProjects(data.projects || [])
                } else {
                    setProjects([])
                }
            } catch (error) {
                console.error("Error fetching projects:", error)
                setProjects([])
            } finally {
                setLoading(false)
            }
        }

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

        fetchProjects()
        fetchVerificationStatus()
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-blue-100 text-blue-700'
            case 'completed':
                return 'bg-green-100 text-green-700'
            case 'paused':
                return 'bg-yellow-100 text-yellow-700'
            case 'cancelled':
                return 'bg-red-100 text-red-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    const getStatusLabel = (status: string) => {
        const statusMap: Record<string, string> = {
            'active': 'Activo',
            'completed': 'Completado',
            'paused': 'En Pausa',
            'cancelled': 'Cancelado',
        }
        return statusMap[status] || status
    }

    if (loading) {
        return (
            <FreelancerLayout>
                <div className="p-8">
                    <div className="max-w-5xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Proyectos</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SkeletonList count={4} />
                        </div>
                    </div>
                </div>
            </FreelancerLayout>
        )
    }

    return (
        <FreelancerLayout>
            <div className="p-8">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Proyectos</h1>

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

                    {projects.length === 0 ? (
                        <Card>
                            <EmptyProjects />
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {projects.map((project) => (
                                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{project.title}</CardTitle>
                                        <Badge className={getStatusColor(project.status)}>
                                            {getStatusLabel(project.status)}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {project.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {project.description}
                                            </p>
                                        )}

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-[#FF5C5C]" />
                                                <span className="font-semibold">€{project.allocated_budget}</span>
                                            </div>
                                            {project.deadline && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(project.deadline).toLocaleDateString('es-ES')}
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-4 flex gap-2">
                                            <Link href={`/freelancer/projects/${project.id}`} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full">
                                                    Ver Detalles
                                                </Button>
                                            </Link>
                                            <Link href={`/contracts/${project.id}`} className="flex-1">
                                                <Button size="sm" className="w-full bg-[#FF5C5C] hover:bg-[#FF5C5C]/90">
                                                    Contrato
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </FreelancerLayout>
    )
}
