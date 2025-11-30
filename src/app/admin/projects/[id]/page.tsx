"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

type Project = {
    id: string
    title: string
    description: string
    status: string
    allocated_budget: number
    created_at: string
    deadline: string | null
    client: any
    freelancer: any
    milestones: any[]
}

export default function AdminProjectDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const [project, setProject] = useState<Project | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editedProject, setEditedProject] = useState<Partial<Project>>({})

    useEffect(() => {
        if (params.id) {
            fetchProject()
        }
    }, [params.id])

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/admin/projects/${params.id}`)
            if (res.ok) {
                const data = await res.json()
                setProject(data.project)
                setEditedProject(data.project)
            }
        } catch (error) {
            console.error('Error fetching project:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo cargar el proyecto"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch(`/api/admin/projects/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editedProject.title,
                    description: editedProject.description,
                    status: editedProject.status,
                    allocated_budget: editedProject.allocated_budget,
                })
            })

            if (res.ok) {
                toast({
                    variant: "success",
                    title: "Guardado",
                    description: "Proyecto actualizado exitosamente"
                })
                fetchProject()
            } else {
                throw new Error('Failed to save')
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo guardar el proyecto"
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-background p-8">
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardContent className="p-12 text-center">
                            <h3 className="text-xl font-semibold mb-2">Proyecto no encontrado</h3>
                            <Link href="/admin/projects">
                                <Button>Volver a Proyectos</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/admin/projects" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Volver a Proyectos
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground mt-2">Editar Proyecto</h1>
                    </div>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Guardar Cambios
                            </>
                        )}
                    </Button>
                </div>

                {/* Project Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detalles del Proyecto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Título</label>
                            <Input
                                value={editedProject.title || ''}
                                onChange={(e) => setEditedProject({ ...editedProject, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Descripción</label>
                            <Textarea
                                value={editedProject.description || ''}
                                onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">Estado</label>
                                <Select
                                    value={editedProject.status || ''}
                                    onValueChange={(value) => setEditedProject({ ...editedProject, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Borrador</SelectItem>
                                        <SelectItem value="open">Abierto</SelectItem>
                                        <SelectItem value="in_progress">En Progreso</SelectItem>
                                        <SelectItem value="completed">Completado</SelectItem>
                                        <SelectItem value="cancelled">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">Presupuesto (€)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editedProject.allocated_budget || 0}
                                    onChange={(e) => setEditedProject({ ...editedProject, allocated_budget: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Client & Freelancer Info */}
                <div className="grid grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cliente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {project.client ? (
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Nombre:</span>{' '}
                                        <span className="font-medium">
                                            {project.client.company_name || `${project.client.first_name} ${project.client.last_name}`}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Email:</span>{' '}
                                        <span className="font-medium">{project.client.email}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Sin cliente asignado</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Freelancer</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {project.freelancer ? (
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Nombre:</span>{' '}
                                        <span className="font-medium">
                                            {project.freelancer.first_name} {project.freelancer.last_name}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Email:</span>{' '}
                                        <span className="font-medium">{project.freelancer.email}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Sin freelancer asignado</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Milestones Section - To be implemented */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hitos del Proyecto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            La gestión de hitos se implementará próximamente
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
