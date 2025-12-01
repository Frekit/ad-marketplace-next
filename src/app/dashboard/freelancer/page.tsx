"use client"

import FreelancerLayout from "@/components/layouts/FreelancerLayout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, Calendar, TrendingUp, Users, MessageSquare, Briefcase, Clock, ArrowRight, ArrowUpRight, ArrowDownRight, RotateCw } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

type DashboardStats = {
    profileViews: number
    proposalsReceived: number
    activeProjects: number
    profileCompletion: number
    missingFields?: string[]
    viewTrend?: number
    viewTrendDirection?: 'up' | 'down' | 'stable'
}

type EarningsStats = {
    totalEarned: number
    pendingEarnings: number
    approvedEarnings: number
    thisMonth: number
    thisYear: number
    averageInvoiceAmount: number
    invoiceCount: number
    invoiceBreakdown: {
        paid: number
        approved: number
        pending: number
        rejected: number
    }
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

type UpcomingMilestone = {
    id: string
    projectId: string
    projectTitle: string
    milestoneName: string
    dueDate: string
    amount: number
    daysUntilDue: number
}

export default function FreelancerDashboard() {
    const { data: session } = useSession()
    const router = useRouter()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [earnings, setEarnings] = useState<EarningsStats | null>(null)
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [tasks, setTasks] = useState<OnboardingTask[]>([])
    const [milestones, setMilestones] = useState<UpcomingMilestone[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingProposals, setLoadingProposals] = useState(true)
    const [loadingTasks, setLoadingTasks] = useState(true)
    const [loadingMilestones, setLoadingMilestones] = useState(true)
    const [loadingEarnings, setLoadingEarnings] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [period, setPeriod] = useState<7 | 30 | 90>(30)
    const userName = session?.user?.name || "Freelancer"

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            await Promise.all([
                (async () => {
                    const res = await fetch("/api/freelancer/profile/completion")
                    if (res.ok) {
                        const data = await res.json()
                        setStats(prev => prev ? {
                            ...prev,
                            profileCompletion: data.completionPercentage || 0,
                            missingFields: data.missingFields || []
                        } : null)
                    }
                })(),
                (async () => {
                    const res = await fetch(`/api/freelancer/stats/profile-views?period=${period}`)
                    if (res.ok) {
                        const data = await res.json()
                        setStats(prev => prev ? {
                            ...prev,
                            profileViews: data.stats?.totalViews || 0,
                            viewTrend: data.stats?.trend || 0,
                            viewTrendDirection: data.stats?.trendDirection || 'stable'
                        } : null)
                    }
                })(),
                (async () => {
                    const res = await fetch("/api/freelancer/proposals")
                    if (res.ok) {
                        const data = await res.json()
                        setProposals(data.proposals || [])
                        setStats(prev => prev ? {
                            ...prev,
                            proposalsReceived: (data.proposals || []).length
                        } : null)
                    }
                })(),
                (async () => {
                    const res = await fetch("/api/freelancer/onboarding/tasks")
                    if (res.ok) {
                        const data = await res.json()
                        setTasks(data.tasks || [])
                    }
                })(),
                (async () => {
                    const res = await fetch("/api/freelancer/calendar/upcoming")
                    if (res.ok) {
                        const data = await res.json()
                        setMilestones(data.milestones || [])
                    }
                })(),
                (async () => {
                    const res = await fetch("/api/freelancer/projects/active")
                    if (res.ok) {
                        const data = await res.json()
                        setStats(prev => prev ? {
                            ...prev,
                            activeProjects: data.count || 0
                        } : null)
                    }
                })(),
                (async () => {
                    const res = await fetch("/api/freelancer/stats/earnings")
                    if (res.ok) {
                        const data = await res.json()
                        setEarnings(data.stats || null)
                    }
                })()
            ])
        } catch (error) {
            console.error("Error refreshing dashboard:", error)
        } finally {
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch profile completion
                const completionRes = await fetch("/api/freelancer/profile/completion")
                let profileCompletion = 0
                let missingFields: string[] = []

                if (completionRes.ok) {
                    const completionData = await completionRes.json()
                    profileCompletion = completionData.completionPercentage || 0
                    missingFields = completionData.missingFields || []
                }

                // Fetch profile views statistics
                const viewsRes = await fetch("/api/freelancer/stats/profile-views")
                let profileViews = 0
                let viewTrend = 0
                let viewTrendDirection: 'up' | 'down' | 'stable' = 'stable'

                if (viewsRes.ok) {
                    const viewsData = await viewsRes.json()
                    profileViews = viewsData.stats?.totalViews || 0
                    viewTrend = viewsData.stats?.trend || 0
                    viewTrendDirection = viewsData.stats?.trendDirection || 'stable'
                }

                setStats({
                    profileViews,
                    proposalsReceived: 0,
                    activeProjects: 0,
                    profileCompletion,
                    missingFields,
                    viewTrend,
                    viewTrendDirection,
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

        const fetchMilestones = async () => {
            try {
                const res = await fetch("/api/freelancer/calendar/upcoming")
                if (res.ok) {
                    const data = await res.json()
                    setMilestones(data.milestones || [])
                }
            } catch (error) {
                console.error("Error fetching milestones:", error)
            } finally {
                setLoadingMilestones(false)
            }
        }

        const fetchActiveProjects = async () => {
            try {
                const res = await fetch("/api/freelancer/projects/active")
                if (res.ok) {
                    const data = await res.json()
                    const projectCount = data.count || 0
                    // Update stats with actual active projects count
                    setStats((prevStats) => prevStats ? ({
                        ...prevStats,
                        activeProjects: projectCount,
                    }) : null)
                }
            } catch (error) {
                console.error("Error fetching active projects:", error)
            }
        }

        const fetchEarnings = async () => {
            try {
                const res = await fetch("/api/freelancer/stats/earnings")
                if (res.ok) {
                    const data = await res.json()
                    setEarnings(data.stats || null)
                }
            } catch (error) {
                console.error("Error fetching earnings:", error)
            } finally {
                setLoadingEarnings(false)
            }
        }

        fetchStats()
        fetchProposals()
        fetchTasks()
        fetchMilestones()
        fetchActiveProjects()
        fetchEarnings()
    }, [])

    // Refetch stats when period changes
    useEffect(() => {
        const fetchViewsWithPeriod = async () => {
            try {
                const res = await fetch(`/api/freelancer/stats/profile-views?period=${period}`)
                if (res.ok) {
                    const data = await res.json()
                    setStats(prev => prev ? {
                        ...prev,
                        profileViews: data.stats?.totalViews || 0,
                        viewTrend: data.stats?.trend || 0,
                        viewTrendDirection: data.stats?.trendDirection || 'stable'
                    } : null)
                }
            } catch (error) {
                console.error("Error fetching profile views with period:", error)
            }
        }
        fetchViewsWithPeriod()
    }, [period])

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
                        <div className="flex gap-3">
                            <Button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                variant="outline"
                                className="gap-2"
                            >
                                <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                {isRefreshing ? 'Actualizando...' : 'Actualizar'}
                            </Button>
                            <Button
                                onClick={() => window.location.href = '/freelancer/profile-settings'}
                                className="bg-primary hover:bg-primary/90 text-white"
                            >
                                Completar mi perfil
                            </Button>
                        </div>
                    </div>

                    {/* Period Selector */}
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setPeriod(7)}
                            variant={period === 7 ? "default" : "outline"}
                            size="sm"
                        >
                            Últimos 7 días
                        </Button>
                        <Button
                            onClick={() => setPeriod(30)}
                            variant={period === 30 ? "default" : "outline"}
                            size="sm"
                        >
                            Últimos 30 días
                        </Button>
                        <Button
                            onClick={() => setPeriod(90)}
                            variant={period === 90 ? "default" : "outline"}
                            size="sm"
                        >
                            Últimos 90 días
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
                                <div className="flex items-end justify-between">
                                    <div className="text-3xl font-bold text-text">{stats?.profileViews || 0}</div>
                                    {stats?.viewTrend !== undefined && stats.viewTrend !== 0 && (
                                        <div className={`flex items-center gap-1 text-sm font-medium ${
                                            stats.viewTrendDirection === 'up' ? 'text-success' : 'text-danger'
                                        }`}>
                                            {stats.viewTrendDirection === 'up' ? (
                                                <ArrowUpRight className="h-4 w-4" />
                                            ) : (
                                                <ArrowDownRight className="h-4 w-4" />
                                            )}
                                            {Math.abs(stats.viewTrend)}%
                                        </div>
                                    )}
                                </div>
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

                    {/* Earnings Section */}
                    {loadingEarnings ? (
                        <div className="space-y-3">
                            {[1, 2].map((i) => (
                                <Card key={i} className="p-6 animate-pulse">
                                    <div className="h-4 bg-muted rounded mb-2 w-1/2"></div>
                                    <div className="h-8 bg-muted rounded mb-2"></div>
                                    <div className="h-3 bg-muted rounded w-3/4"></div>
                                </Card>
                            ))}
                        </div>
                    ) : earnings ? (
                        <div>
                            <h2 className="text-xl font-bold text-text mb-4">Ganancias</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-text-muted">Ganancia total</span>
                                        <TrendingUp className="h-5 w-5 text-success" />
                                    </div>
                                    <div className="text-3xl font-bold text-text">€{earnings.totalEarned.toFixed(2)}</div>
                                    <p className="text-xs text-text-muted mt-1">{earnings.invoiceCount} facturas pagadas</p>
                                </Card>

                                <Card className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-text-muted">Este mes</span>
                                        <Calendar className="h-5 w-5 text-text-muted" />
                                    </div>
                                    <div className="text-3xl font-bold text-text">€{earnings.thisMonth.toFixed(2)}</div>
                                    <p className="text-xs text-text-muted mt-1">Ingresos de este mes</p>
                                </Card>

                                <Card className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-text-muted">Ganancias pendientes</span>
                                        <AlertCircle className="h-5 w-5 text-warning" />
                                    </div>
                                    <div className="text-3xl font-bold text-warning">€{earnings.pendingEarnings.toFixed(2)}</div>
                                    <p className="text-xs text-text-muted mt-1">{earnings.invoiceBreakdown.pending} facturas en espera</p>
                                </Card>

                                <Card className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-text-muted">Ganancia media por factura</span>
                                        <Briefcase className="h-5 w-5 text-text-muted" />
                                    </div>
                                    <div className="text-3xl font-bold text-text">€{earnings.averageInvoiceAmount.toFixed(2)}</div>
                                    <p className="text-xs text-text-muted mt-1">Basado en {earnings.invoiceCount} facturas</p>
                                </Card>
                            </div>
                        </div>
                    ) : null}

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

                    {/* Calendar Section - Upcoming Milestones */}
                    <div>
                        <h2 className="text-xl font-bold text-text mb-4">Próximos Hitos</h2>
                        {loadingMilestones ? (
                            <div className="space-y-3">
                                {[1, 2].map((i) => (
                                    <Card key={i} className="p-4 animate-pulse">
                                        <div className="h-4 bg-muted rounded mb-2 w-1/2"></div>
                                        <div className="h-3 bg-muted rounded w-3/4"></div>
                                    </Card>
                                ))}
                            </div>
                        ) : milestones.length > 0 ? (
                            <div className="space-y-3">
                                {milestones.map((milestone) => {
                                    const isUrgent = milestone.daysUntilDue <= 3
                                    const isWarning = milestone.daysUntilDue <= 7

                                    return (
                                        <Card
                                            key={milestone.id}
                                            className={`p-4 border-l-4 ${
                                                isUrgent ? 'border-l-danger bg-danger/5' :
                                                    isWarning ? 'border-l-warning bg-warning/5' :
                                                        'border-l-accent bg-accent/5'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-text">{milestone.milestoneName}</h3>
                                                    <p className="text-sm text-text-muted mt-1">{milestone.projectTitle}</p>
                                                    <div className="flex items-center gap-4 mt-3">
                                                        <span className="text-xs text-text-muted flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(milestone.dueDate).toLocaleDateString('es-ES')}
                                                        </span>
                                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                            isUrgent ? 'bg-danger/20 text-danger' :
                                                                isWarning ? 'bg-warning/20 text-warning' :
                                                                    'bg-success/20 text-success'
                                                        }`}>
                                                            {milestone.daysUntilDue} días
                                                        </span>
                                                        <span className="text-sm font-medium text-text-secondary">€{milestone.amount.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <Card className="p-8 text-center">
                                <Calendar className="h-12 w-12 mx-auto mb-4 text-text-muted" />
                                <p className="text-text font-medium">No tienes hitos próximos</p>
                                <p className="text-sm text-text-muted mt-2">Cuando comiences un proyecto, verás los hitos aquí</p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </FreelancerLayout>
    )
}
