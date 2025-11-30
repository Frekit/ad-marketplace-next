"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Briefcase, Search, Filter, Edit, Eye, Loader2, Calendar, Euro, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Project = {
    id: string
    title: string
    description: string
    status: string
    allocated_budget: number
    created_at: string
    deadline: string | null
    client: {
        id: string
        email: string
        first_name: string
        last_name: string
        company_name: string | null
    } | null
    freelancer: {
        id: string
        email: string
        first_name: string
        last_name: string
    } | null
    milestones: any[]
}

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        fetchProjects()
    }, [])

    useEffect(() => {
        filterProjects()
    }, [searchQuery, statusFilter, projects])

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/admin/projects')
            if (res.ok) {
                const data = await res.json()
                setProjects(data.projects)
            }
        } catch (error) {
            console.error('Error fetching projects:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudieron cargar los proyectos"
            })
        } finally {
            setLoading(false)
        }
    }

    const filterProjects = () => {
        let filtered = projects

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.client?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.client?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.freelancer?.email?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Filter by status
        if (statusFilter !== "all") {
            filtered = filtered.filter(p => p.status === statusFilter)
        }

        setFilteredProjects(filtered)
    }

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string }> = {
            draft: { label: "Borrador", className: "bg-gray-500/10 text-gray-700 border-gray-500/20" },
            open: { label: "Abierto", className: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
            in_progress: { label: "En Progreso", className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
            completed: { label: "Completado", className: "bg-green-500/10 text-green-700 border-green-500/20" },
            cancelled: { label: "Cancelado", className: "bg-red-500/10 text-red-700 border-red-500/20" },
        }

        const config = statusConfig[status] || statusConfig.draft
        return <Badge variant="outline" className={config.className}>{config.label}</Badge>
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/admin/dashboard" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
                        ← Volver al Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground">Gestión de Proyectos</h1>
                    <p className="text-muted-foreground mt-2">
                        Vista completa de todos los proyectos de la plataforma
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground">Total</div>
                            <div className="text-2xl font-bold text-foreground">{projects.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground">Abiertos</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {projects.filter(p => p.status === 'open').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground">En Progreso</div>
                            <div className="text-2xl font-bold text-yellow-600">
                                {projects.filter(p => p.status === 'in_progress').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground">Completados</div>
                            <div className="text-2xl font-bold text-green-600">
                                {projects.filter(p => p.status === 'completed').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground">Cancelados</div>
                            <div className="text-2xl font-bold text-red-600">
                                {projects.filter(p => p.status === 'cancelled').length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por título, cliente, freelancer..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los estados</SelectItem>
                                    <SelectItem value="draft">Borrador</SelectItem>
                                    <SelectItem value="open">Abierto</SelectItem>
                                    <SelectItem value="in_progress">En Progreso</SelectItem>
                                    <SelectItem value="completed">Completado</SelectItem>
                                    <SelectItem value="cancelled">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Projects Table */}
                {filteredProjects.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                No se encontraron proyectos
                            </h3>
                            <p className="text-muted-foreground">
                                {searchQuery || statusFilter !== "all"
                                    ? "Intenta ajustar los filtros"
                                    : "Aún no hay proyectos en la plataforma"}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredProjects.map((project) => (
                            <Card key={project.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-foreground">
                                                    {project.title}
                                                </h3>
                                                {getStatusBadge(project.status)}
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {project.description}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => router.push(`/admin/projects/${project.id}`)}
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Editar
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <div className="text-xs text-muted-foreground">Cliente</div>
                                                <div className="font-medium text-foreground">
                                                    {project.client?.company_name ||
                                                        `${project.client?.first_name} ${project.client?.last_name}` ||
                                                        'Sin asignar'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <div className="text-xs text-muted-foreground">Freelancer</div>
                                                <div className="font-medium text-foreground">
                                                    {project.freelancer
                                                        ? `${project.freelancer.first_name} ${project.freelancer.last_name}`
                                                        : 'Sin asignar'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Euro className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <div className="text-xs text-muted-foreground">Presupuesto</div>
                                                <div className="font-medium text-foreground">
                                                    €{project.allocated_budget?.toFixed(2) || '0.00'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <div className="text-xs text-muted-foreground">Creado</div>
                                                <div className="font-medium text-foreground">
                                                    {new Date(project.created_at).toLocaleDateString('es-ES')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
