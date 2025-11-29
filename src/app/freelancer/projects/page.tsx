"use client"

import FreelancerLayout from "@/components/layouts/FreelancerLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, Calendar, DollarSign, Briefcase } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

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

        fetchProjects()
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
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5C5C]"></div>
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

                    {projects.length === 0 ? (
                        <Card className="p-12">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="mb-6">
                                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-4">
                                        <FolderOpen className="h-12 w-12 text-gray-400" />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    ¡Sin proyectos, por ahora!
                                </h2>
                                <p className="text-gray-600 max-w-md mb-8">
                                    Aquí podrás ver y gestionar tus proyectos con los clientes. Cuando recibas tu primera propuesta de proyecto o un cliente te contrate, aparecerá aquí.
                                </p>
                                <Link href="/freelancer/proposals">
                                    <Button className="bg-[#FF5C5C] hover:bg-[#FF5C5C]/90 text-white">
                                        Ver Propuestas Disponibles
                                    </Button>
                                </Link>
                            </div>
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
