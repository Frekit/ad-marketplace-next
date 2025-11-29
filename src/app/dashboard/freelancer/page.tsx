"use client"

import FreelancerLayout from "@/components/layouts/FreelancerLayout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, Calendar, TrendingUp, Users, MessageSquare, Briefcase, Clock, ArrowRight } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"

type DashboardStats = {
    profileViews: number
    proposalsReceived: number
    activeProjects: number
    profileCompletion: number
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

export default function FreelancerDashboard() {
    const { data: session } = useSession()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingProposals, setLoadingProposals] = useState(true)
    const userName = session?.user?.name || "Freelancer"

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/freelancer/profile")
                if (res.ok) {
                    const data = await res.json()
                    setStats({
                        profileViews: data.profileViews || 0,
                        proposalsReceived: data.proposalsReceived || 0,
                        activeProjects: data.activeProjects || 0,
                        profileCompletion: data.profileCompletion || 0,
                    })
                } else {
                    // Fallback to default stats if API call fails
                    setStats({
                        profileViews: 0,
                        proposalsReceived: 0,
                        activeProjects: 0,
                        profileCompletion: 0,
                    })
                }
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
                    setProposals(data.proposals || [])
                }
            } catch (error) {
                console.error("Error fetching proposals:", error)
            } finally {
                setLoadingProposals(false)
            }
        }

        fetchStats()
        fetchProposals()
    }, [])

    const profileCompletion = stats?.profileCompletion || 0

    return (
        <FreelancerLayout>
            <div className="p-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Profile Completion Alert */}
                    <Card className="bg-yellow-50 border-yellow-200 p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                                    <h3 className="font-bold text-gray-900">Tu perfil no está completo</h3>
                                </div>
                                <p className="text-sm text-gray-700 mb-4">
                                    Para ser visible en los motores de búsqueda, tu perfil debe estar completo al 100%. Completa los siguientes pasos para aumentar tu visibilidad y recibir más propuestas de proyecto.
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 bg-white rounded-full h-2">
                                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${profileCompletion}%` }}></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{profileCompletion}%</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Welcome Section */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Bienvenido de nuevo {userName}</h1>
                            <p className="text-gray-600 mt-1">Aquí está un resumen de tu actividad reciente</p>
                        </div>
                        <Button
                            onClick={() => window.location.href = '/freelancer/profile-settings'}
                            className="bg-[#FF5C5C] hover:bg-[#FF5C5C]/90 text-white"
                        >
                            Completar mi perfil
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="p-6 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Vistas del perfil</span>
                                    <Users className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="text-3xl font-bold text-gray-900">{stats?.profileViews || 0}</div>
                                <p className="text-xs text-gray-500 mt-1">En los últimos 30 días</p>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Propuestas recibidas</span>
                                    <MessageSquare className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="text-3xl font-bold text-gray-900">{stats?.proposalsReceived || 0}</div>
                                <p className="text-xs text-gray-500 mt-1">En los últimos 30 días</p>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Proyectos activos</span>
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="text-3xl font-bold text-gray-900">{stats?.activeProjects || 0}</div>
                                <p className="text-xs text-gray-500 mt-1">Proyectos en curso</p>
                            </Card>
                        </div>
                    )}

                    {/* My Proposals Section */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Mis Propuestas</h2>
                        {loadingProposals ? (
                            <div className="space-y-3">
                                {[1, 2].map((i) => (
                                    <Card key={i} className="p-4 animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                    </Card>
                                ))}
                            </div>
                        ) : proposals.length > 0 ? (
                            <div className="space-y-3">
                                {proposals.map((proposal) => (
                                    <Card key={proposal.id} className="p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{proposal.project.title}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{proposal.project.description?.substring(0, 100)}...</p>
                                                <div className="flex items-center gap-4 mt-3">
                                                    <span className="text-xs text-gray-500">
                                                        Cliente: <span className="font-medium text-gray-700">{proposal.client.name}</span>
                                                    </span>
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                        proposal.status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : proposal.status === 'accepted'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {proposal.status === 'pending' && '⏳ Pendiente'}
                                                        {proposal.status === 'accepted' && '✅ Aceptada'}
                                                        {proposal.status === 'rejected' && '❌ Rechazada'}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button className="ml-4 bg-blue-600 hover:bg-blue-700 text-white">
                                                Ver detalles
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="p-8 text-center">
                                <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-gray-600">No tienes propuestas de proyectos aún</p>
                                <p className="text-sm text-gray-500 mt-2">Completa tu perfil para recibir propuestas de clientes</p>
                            </Card>
                        )}
                    </div>

                    {/* Action Required Section */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Tareas por hacer</h2>
                        <div className="space-y-3">
                            <Card className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Añade una descripción a tu perfil</h3>
                                        <p className="text-sm text-gray-600">Cuéntale a los clientes quién eres y qué haces</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">Completar</Button>
                            </Card>

                            <Card className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Añade tu experiencia profesional</h3>
                                        <p className="text-sm text-gray-600">Muestra tus proyectos anteriores y experiencia</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">Completar</Button>
                            </Card>

                            <Card className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Verifica tu identidad</h3>
                                        <p className="text-sm text-gray-600">Aumenta la confianza de los clientes</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">Completar</Button>
                            </Card>
                        </div>
                    </div>

                    {/* Calendar Section */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Mi calendario</h2>
                            <Button variant="outline" size="sm">Ver calendario</Button>
                        </div>
                        <div className="text-center py-12 text-gray-500">
                            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No tienes eventos próximos</p>
                        </div>
                    </Card>
                </div>
            </div>
        </FreelancerLayout>
    )
}
