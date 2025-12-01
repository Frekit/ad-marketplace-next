"use client"

import FreelancerLayout from "@/components/layouts/FreelancerLayout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, Calendar, TrendingUp, Users, MessageSquare, Briefcase, ArrowRight, ArrowUpRight, ArrowDownRight, RotateCw } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState, useEffect, useCallback } from "react"

type DashboardOverview = {
    stats: {
        profileCompletion: number
        profileViews: number
        proposalsReceived: number
        activeProjects: number
        missingFields?: string[]
        viewTrend?: number
        viewTrendDirection?: 'up' | 'down' | 'stable'
    }
    earnings: {
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
    proposals: any[]
    tasks: any[]
    milestones: any[]
}

export default function FreelancerDashboard() {
    const { data: session } = useSession()
    const [data, setData] = useState<DashboardOverview | null>(null)
    const [loading, setLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const userName = session?.user?.name || "Freelancer"

    // Use single API call with aggressive caching
    const fetchDashboardData = useCallback(async () => {
        const startTime = performance.now()
        try {
            const res = await fetch("/api/freelancer/dashboard/overview", {
                headers: {
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Cache-Control': 'max-age=60'
                }
            })
            if (res.ok) {
                const dashboardData = await res.json()
                const loadTime = performance.now() - startTime

                // Log cache performance
                const cacheStatus = res.headers.get('X-Cache') || 'UNKNOWN'
                console.log(`[Dashboard] ${cacheStatus} - Load time: ${loadTime.toFixed(1)}ms`)

                setData(dashboardData)
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
        } finally {
            setLoading(false)
        }
    }, [])

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            const res = await fetch("/api/freelancer/dashboard/overview")
            if (res.ok) {
                const dashboardData = await res.json()
                setData(dashboardData)
            }
        } catch (error) {
            console.error("Error refreshing dashboard:", error)
        } finally {
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [fetchDashboardData])

    const profileCompletion = data?.stats?.profileCompletion || 0

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
                                    <div className="text-3xl font-bold text-text">{data?.stats?.profileViews || 0}</div>
                                    {data?.stats?.viewTrend !== undefined && data.stats.viewTrend !== 0 && (
                                        <div className={`flex items-center gap-1 text-sm font-medium ${
                                            data.stats.viewTrendDirection === 'up' ? 'text-success' : 'text-danger'
                                        }`}>
                                            {data.stats.viewTrendDirection === 'up' ? (
                                                <ArrowUpRight className="h-4 w-4" />
                                            ) : (
                                                <ArrowDownRight className="h-4 w-4" />
                                            )}
                                            {Math.abs(data.stats.viewTrend)}%
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
                                <div className="text-3xl font-bold text-text">{data?.stats?.proposalsReceived || 0}</div>
                                <p className="text-xs text-text-muted mt-1">En los últimos 30 días</p>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-text-muted">Proyectos activos</span>
                                    <Calendar className="h-5 w-5 text-text-muted" />
                                </div>
                                <div className="text-3xl font-bold text-text">{data?.stats?.activeProjects || 0}</div>
                                <p className="text-xs text-text-muted mt-1">Proyectos en curso</p>
                            </Card>
                        </div>
                    )}

                    {/* Earnings Section */}
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2].map((i) => (
                                <Card key={i} className="p-6 animate-pulse">
                                    <div className="h-4 bg-muted rounded mb-2 w-1/2"></div>
                                    <div className="h-8 bg-muted rounded mb-2"></div>
                                    <div className="h-3 bg-muted rounded w-3/4"></div>
                                </Card>
                            ))}
                        </div>
                    ) : data?.earnings ? (
                        <div>
                            <h2 className="text-xl font-bold text-text mb-4">Ganancias</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-text-muted">Ganancia total</span>
                                        <TrendingUp className="h-5 w-5 text-success" />
                                    </div>
                                    <div className="text-3xl font-bold text-text">€{data.earnings.totalEarned.toFixed(2)}</div>
                                    <p className="text-xs text-text-muted mt-1">{data.earnings.invoiceCount} facturas pagadas</p>
                                </Card>

                                <Card className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-text-muted">Este mes</span>
                                        <Calendar className="h-5 w-5 text-text-muted" />
                                    </div>
                                    <div className="text-3xl font-bold text-text">€{data.earnings.thisMonth.toFixed(2)}</div>
                                    <p className="text-xs text-text-muted mt-1">Ingresos de este mes</p>
                                </Card>

                                <Card className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-text-muted">Ganancias pendientes</span>
                                        <AlertCircle className="h-5 w-5 text-warning" />
                                    </div>
                                    <div className="text-3xl font-bold text-warning">€{data.earnings.pendingEarnings.toFixed(2)}</div>
                                    <p className="text-xs text-text-muted mt-1">{data.earnings.invoiceBreakdown.pending} facturas en espera</p>
                                </Card>

                                <Card className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-text-muted">Ganancia media por factura</span>
                                        <Briefcase className="h-5 w-5 text-text-muted" />
                                    </div>
                                    <div className="text-3xl font-bold text-text">€{data.earnings.averageInvoiceAmount.toFixed(2)}</div>
                                    <p className="text-xs text-text-muted mt-1">Basado en {data.earnings.invoiceCount} facturas</p>
                                </Card>
                            </div>
                        </div>
                    ) : null}

                    {/* My Proposals Section */}
                    <div>
                        <h2 className="text-xl font-bold text-text mb-4">Mis Propuestas</h2>
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2].map((i) => (
                                    <Card key={i} className="p-4 animate-pulse">
                                        <div className="h-4 bg-muted rounded mb-2 w-1/2"></div>
                                        <div className="h-3 bg-muted rounded w-3/4"></div>
                                    </Card>
                                ))}
                            </div>
                        ) : data?.proposals && data.proposals.length > 0 ? (
                            <div className="space-y-3">
                                {data.proposals.slice(0, 5).map((proposal: any) => (
                                    <Card
                                        key={proposal.id}
                                        className="p-4 hover:bg-surface-hover cursor-pointer transition"
                                        onClick={() => window.location.href = `/freelancer/proposals/${proposal.id}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-text">{proposal.project?.title || 'Unknown Project'}</h3>
                                                <p className="text-sm text-text-muted">{proposal.client?.name || 'Unknown Client'}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded text-xs font-medium ${
                                                proposal.status === 'accepted' ? 'bg-success/20 text-success' :
                                                proposal.status === 'rejected' ? 'bg-danger/20 text-danger' :
                                                'bg-warning/20 text-warning'
                                            }`}>
                                                {proposal.status === 'accepted' ? 'Aceptada' :
                                                 proposal.status === 'rejected' ? 'Rechazada' :
                                                 'Pendiente'}
                                            </span>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="p-6 text-center">
                                <p className="text-text-muted">No hay propuestas disponibles</p>
                            </Card>
                        )}
                    </div>

                    {/* Upcoming Milestones Section */}
                    <div>
                        <h2 className="text-xl font-bold text-text mb-4">Próximos Hitos</h2>
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2].map((i) => (
                                    <Card key={i} className="p-4 animate-pulse">
                                        <div className="h-4 bg-muted rounded mb-2 w-1/2"></div>
                                        <div className="h-3 bg-muted rounded w-3/4"></div>
                                    </Card>
                                ))}
                            </div>
                        ) : data?.milestones && data.milestones.length > 0 ? (
                            <div className="space-y-3">
                                {data.milestones.slice(0, 5).map((milestone: any) => {
                                    const urgencyColor = milestone.daysUntilDue <= 3 ? 'bg-danger/20' :
                                                        milestone.daysUntilDue <= 7 ? 'bg-warning/20' :
                                                        'bg-success/20'
                                    const textColor = milestone.daysUntilDue <= 3 ? 'text-danger' :
                                                     milestone.daysUntilDue <= 7 ? 'text-warning' :
                                                     'text-success'

                                    return (
                                        <Card key={milestone.id} className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-text">{milestone.milestoneName}</h3>
                                                    <p className="text-sm text-text-muted">{milestone.projectTitle}</p>
                                                    <p className="text-xs text-text-muted mt-1">Vence en {milestone.daysUntilDue} días</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-text">€{milestone.amount.toFixed(2)}</div>
                                                    <div className={`text-xs font-medium mt-1 px-2 py-1 rounded ${urgencyColor} ${textColor}`}>
                                                        {milestone.daysUntilDue} días
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>
                        ) : (
                            <Card className="p-6 text-center">
                                <p className="text-text-muted">No hay hitos próximos</p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </FreelancerLayout>
    )
}
