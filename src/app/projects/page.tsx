"use client"

import { useState, useEffect } from "react"
import ClientLayout from "@/components/layouts/ClientLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, Plus, Eye, Edit2, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Project = {
    id: string
    title: string
    description: string
    status: string
    allocated_budget?: number
    skills_required?: string[]
    created_at: string
    updated_at: string
}

export default function ClientProjectsPage() {
    const router = useRouter()
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            const res = await fetch("/api/projects")
            if (res.ok) {
                const data = await res.json()
                setProjects(data.projects || [])
            } else if (res.status === 401) {
                router.push("/sign-in")
            } else {
                setError("No se pudieron cargar los proyectos")
            }
        } catch (err) {
            console.error("Error fetching projects:", err)
            setError("Error al cargar los proyectos")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (projectId: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: "DELETE",
            })

            if (res.ok) {
                setProjects(projects.filter(p => p.id !== projectId))
                setDeleteConfirm(null)
            } else {
                setError("Error al eliminar el proyecto")
            }
        } catch (err) {
            console.error("Error deleting project:", err)
            setError("Error al eliminar el proyecto")
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-700'
            case 'open':
                return 'bg-blue-100 text-blue-700'
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-700'
            case 'completed':
                return 'bg-green-100 text-green-700'
            case 'cancelled':
                return 'bg-red-100 text-red-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'draft':
                return 'Borrador'
            case 'open':
                return 'Abierto'
            case 'in_progress':
                return 'En Progreso'
            case 'completed':
                return 'Completado'
            case 'cancelled':
                return 'Cancelado'
            default:
                return status
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

    return (
        <ClientLayout>
            <div className="p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Mis Proyectos</h1>
                            <p className="text-gray-600 mt-1">Gestiona tus proyectos y propuestas</p>
                        </div>
                        <Link href="/projects/new">
                            <Button className="bg-[#FF5C5C] hover:bg-[#FF5C5C]/90 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo Proyecto
                            </Button>
                        </Link>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    {projects.length === 0 ? (
                        <Card className="p-12">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="mb-6">
                                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-4">
                                        <FolderOpen className="h-12 w-12 text-gray-400" />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    ¡Sin proyectos aún!
                                </h2>
                                <p className="text-gray-600 max-w-md mb-8">
                                    Crea tu primer proyecto para empezar a buscar freelancers y recibir propuestas.
                                </p>
                                <Link href="/projects/new">
                                    <Button className="bg-[#FF5C5C] hover:bg-[#FF5C5C]/90 text-white">
                                        Crear Primer Proyecto
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {projects.map((project) => (
                                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 cursor-pointer" onClick={() => router.push(`/projects/${project.id}`)}>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                                                    <Badge className={getStatusColor(project.status)}>
                                                        {getStatusLabel(project.status)}
                                                    </Badge>
                                                </div>
                                                <p className="text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                                    <span>Creado: {new Date(project.created_at).toLocaleDateString('es-ES')}</span>
                                                    {project.allocated_budget && (
                                                        <span>Presupuesto: €{project.allocated_budget.toFixed(2)}</span>
                                                    )}
                                                </div>
                                                {project.skills_required && project.skills_required.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {project.skills_required.map((skill, idx) => (
                                                            <Badge key={idx} variant="outline" className="text-xs">
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0">
                                                <Link href={`/projects/${project.id}`}>
                                                    <Button variant="outline" size="sm" title="Ver detalles">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/projects/${project.id}/edit`}>
                                                    <Button variant="outline" size="sm" title="Editar">
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    title="Eliminar"
                                                    onClick={() => setDeleteConfirm(project.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {deleteConfirm === project.id && (
                                            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between bg-red-50 p-3 rounded">
                                                <p className="text-sm text-red-700">¿Está seguro de que desea eliminar este proyecto?</p>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setDeleteConfirm(null)}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                        onClick={() => handleDelete(project.id)}
                                                    >
                                                        Eliminar
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
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
