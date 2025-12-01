"use client"

import FreelancerLayout from "@/components/layouts/FreelancerLayout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, Calendar, TrendingUp, Users, MessageSquare, Briefcase, Clock, ArrowRight } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

type DashboardStats = {
    profileViews: number
    proposalsReceived: number
    activeProjects: number
    profileCompletion: number
    missingFields?: string[]
}

type Proposal = {
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
        company: string
    }
    status: string
    created_at: string
}

type OnboardingTask = {
    type: string
    label: string
    description: string
    completed: boolean
    url: string
    icon: string
}

export default function FreelancerDashboard() {
    const { data: session } = useSession()
    const router = useRouter()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [tasks, setTasks] = useState<OnboardingTask[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingProposals, setLoadingProposals] = useState(true)
    const [loadingTasks, setLoadingTasks] = useState(true)
    const userName = session?.user?.name || "Freelancer"

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch profile completion separately
                const completionRes = await fetch("/api/freelancer/profile/completion")
                let profileCompletion = 0
                let missingFields: string[] = []

                if (completionRes.ok) {
                    const completionData = await completionRes.json()
                    profileCompletion = completionData.completionPercentage || 0
                    missingFields = completionData.missingFields || []
                }

                setStats({
                    profileViews: 0,
                    proposalsReceived: 0,
                    activeProjects: 0,
                    profileCompletion,
                    missingFields,
                })
            } catch (error) {
                console.error("Error fetching stats:", error)
                setStats({
                    profileViews: 0,
                    proposalsReceived: 0,
                    activeProjects: 0,
                    profileCompletion: 0,
                })
            } finally {
                setLoading(false)
            }
        }

        const fetchProposals = async () => {
            try {
                const res = await fetch("/api/freelancer/proposals")
                if (res.ok) {
                    const data = await res.json()
                    const proposalsList = data.proposals || []
                    setProposals(proposalsList)

                    // Update stats with actual proposal count
                    setStats((prevStats) => prevStats ? ({
                        ...prevStats,
                        proposalsReceived: proposalsList.length,
                    }) : null)
                } else {
                    const error = await res.json()
                    console.error("Error fetching proposals:", res.status, error)
                }
            } catch (error) {
                console.error("Error fetching proposals:", error)
            } finally {
                setLoadingProposals(false)
            }
        }

        const fetchTasks = async () => {
            try {
                const res = await fetch("/api/freelancer/onboarding/tasks")
                if (res.ok) {
                    const data = await res.json()
                    setTasks(data.tasks || [])
                }
            } catch (error) {
                console.error("Error fetching tasks:", error)
            } finally {
                setLoadingTasks(false)
            }
        }

        fetchStats()
        fetchProposals()
        fetchTasks()
    }, [])

    const profileCompletion = stats?.profileCompletion || 0

    return (
        <FreelancerLayout>
            <div className="p-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Profile Completion Alert */}
                    <Card className="bg-warning/10 border-warning p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="h-5 w-5 text-warning" />
                                    <h3 className="font-bold text-text">Tu perfil no está completo</h3>
                                </div>
                                <p className="text-sm text-text-muted mb-4">
                                    Para ser visible en los motores de búsqueda, tu perfil debe estar completo al 100%. Completa los siguientes pasos para aumentar tu visibilidad y recibir más propuestas de proyecto.
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 bg-muted rounded-full h-2">
                                        <div className="bg-warning h-2 rounded-full" style={{ width: `${profileCompletion}%` }}></div>
                                    </div>
                                    <span className="text-sm font-medium text-text-secondary">{profileCompletion}%</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Welcome Section */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-text">Bienvenido de nuevo {userName}</h1>
                            <p className="text-text-muted mt-1">Aquí está un resumen de tu actividad reciente</p>
                        </div>
                        <Button
                            onClick={() => window.location.href = '/freelancer/profile-settings'}
                            className="bg-primary hover:bg-primary/90 text-white"
                        >
                            Completar mi perfil
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="p-6 animate-pulse">
                                    <div className="h-4 bg-muted rounded mb-2 w-1/2"></div>
                                    <div className="h-8 bg-muted rounded mb-2"></div>
                                    <div className="h-3 bg-muted rounded w-3/4"></div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-text-muted">Vistas del perfil</span>
                                    <Users className="h-5 w-5 text-text-muted" />
                                </div>
                                <div className="text-3xl font-bold text-text">{stats?.profileViews || 0}</div>
                                <p className="text-xs text-text-muted mt-1">En los últimos 30 días</p>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-text-muted">Propuestas recibidas</span>
                                    <MessageSquare className="h-5 w-5 text-text-muted" />
                                </div>
                                <div className="text-3xl font-bold text-text">{stats?.proposalsReceived || 0}</div>
                                <p className="text-xs text-text-muted mt-1">En los últimos 30 días</p>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-text-muted">Proyectos activos</span>
                                    <Calendar className="h-5 w-5 text-text-muted" />
                                </div>
                                <div className="text-3xl font-bold text-text">{stats?.activeProjects || 0}</div>
                                <p className="text-xs text-text-muted mt-1">Proyectos en curso</p>
                            </Card>
                        </div>
                    )}

                    {/* My Proposals Section */}
                    <div>
                        <h2 className="text-xl font-bold text-text mb-4">Mis Propuestas</h2>
                        {loadingProposals ? (
                            <div className="space-y-3">
                                {[1, 2].map((i) => (
                                    <Card key={i} className="p-4 animate-pulse">
                                        <div className="h-4 bg-muted rounded mb-2 w-1/2"></div>
                                        <div className="h-3 bg-muted rounded w-3/4"></div>
                                    </Card>
                                ))}
                            </div>
                        ) : proposals.length > 0 ? (
                            <div className="space-y-3">
                                {proposals.map((proposal) => (
                                    <Card key={proposal.id} className="p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-text">{proposal.project.title}</h3>
                                                <p className="text-sm text-text-muted mt-1">{proposal.project.description?.substring(0, 100)}...</p>
                                                <div className="flex items-center gap-4 mt-3">
                                                    <span className="text-xs text-text-muted">
                                                        Cliente: <span className="font-medium text-text-secondary">{proposal.client.name}</span>
                                                    </span>
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                        proposal.status === 'pending'
                                                            ? 'bg-warning/30 text-warning'
                                                            : proposal.status === 'accepted'
                                                            ? 'bg-success/30 text-success'
                                                            : 'bg-danger/30 text-danger'
                                                    }`}>
                                                        {proposal.status === 'pending' && '⏳ Pendiente'}
                                                        {proposal.status === 'accepted' && '✅ Aceptada'}
                                                        {proposal.status === 'rejected' && '❌ Rechazada'}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => router.push(`/freelancer/proposals/${proposal.id}`)}
                                                className="ml-4 bg-accent hover:bg-accent/90 text-white"
                                            >
                                                Ver detalles
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="p-8 text-center">
                                <Briefcase className="h-12 w-12 mx-auto mb-4 text-text-muted" />
                                <p className="text-text-muted">No tienes propuestas de proyectos aún</p>
                                <p className="text-sm text-text-muted mt-2">Completa tu perfil para recibir propuestas de clientes</p>
                            </Card>
                        )}
                    </div>

                    {/* Action Required Section */}
                    <div>
                        <h2 className="text-xl font-bold text-text mb-4">Tareas por hacer</h2>
                        {loadingTasks ? (
                            <div className="space-y-3">
                                {[1, 2].map((i) => (
                                    <Card key={i} className="p-4 animate-pulse">
                                        <div className="h-4 bg-muted rounded mb-2 w-1/2"></div>
                                        <div className="h-3 bg-muted rounded w-3/4"></div>
                                    </Card>
                                ))}
                            </div>
                        ) : tasks.length > 0 ? (
                            <div className="space-y-3">
                                {tasks.map((task) => (
                                    <Card
                                        key={task.type}
                                        className={`p-4 flex items-center justify-between hover:shadow-md transition-shadow ${
                                            task.completed ? 'opacity-60' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                                task.completed ? 'bg-success/20' : 'bg-accent/20'
                                            }`}>
                                                <CheckCircle2 className={`h-5 w-5 ${
                                                    task.completed ? 'text-success' : 'text-accent'
                                                }`} />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-text">{task.label}</h3>
                                                <p className="text-sm text-text-muted">{task.description}</p>
                                            </div>
                                        </div>
                                        {!task.completed && (
                                            <Button
                                                onClick={() => router.push(task.url)}
                                                variant="outline"
                                                size="sm"
                                            >
                                                Completar
                                            </Button>
                                        )}
                                        {task.completed && (
                                            <span className="text-sm font-medium text-success">✓ Completado</span>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="p-8 text-center">
                                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-success" />
                                <p className="text-text font-medium">¡Excelente! Has completado todas las tareas</p>
                                <p className="text-sm text-text-muted mt-2">Tu perfil está 100% completo y visible para clientes</p>
                            </Card>
                        )}
                    </div>

                    {/* Calendar Section */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-text">Mi calendario</h2>
                            <Button variant="outline" size="sm">Ver calendario</Button>
                        </div>
                        <div className="text-center py-12 text-text-muted">
                            <Calendar className="h-12 w-12 mx-auto mb-4 text-text-muted" />
                            <p>No tienes eventos próximos</p>
                        </div>
                    </Card>
                </div>
            </div>
        </FreelancerLayout>
    )
}
