"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BarChart3, Users, FileText, DollarSign, AlertCircle, Search, TrendingUp, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"

type Stats = {
    totalInvoices: number
    pendingInvoices: number
    approvedInvoices: number
    paidInvoices: number
    rejectedInvoices: number
    totalRevenue: number
    totalUsers: number
    totalProjects: number
    totalFreelancers: number
    totalClients: number
    invoiceStatus: {
        pending: number
        approved: number
        paid: number
        rejected: number
    }
}

export default function AdminDashboard() {
    const router = useRouter()
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/stats")
            if (res.ok) {
                const data = await res.json()
                setStats(data)
            } else if (res.status === 403) {
                router.push("/sign-in")
            } else {
                setError("Error al cargar estadísticas")
            }
        } catch (err) {
            console.error("Error fetching stats:", err)
            setError("Error al cargar datos")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5C5C]"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
                            <p className="text-gray-600 mt-1">Gestiona invoices, usuarios y pagos</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => {
                                fetch("/api/auth/signout", { method: "POST" })
                                router.push("/sign-in")
                            }}
                        >
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-8 py-12">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        {error}
                    </div>
                )}

                {/* Stats Grid */}
                {stats && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                            <Card className="bg-white border-l-4 border-l-blue-500">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Total Invoices</p>
                                            <p className="text-3xl font-bold text-gray-900">{stats.totalInvoices}</p>
                                        </div>
                                        <FileText className="h-12 w-12 text-blue-500 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border-l-4 border-l-orange-500">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Pending</p>
                                            <p className="text-3xl font-bold text-orange-600">{stats.pendingInvoices}</p>
                                        </div>
                                        <Clock className="h-12 w-12 text-orange-500 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border-l-4 border-l-green-500">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Approved</p>
                                            <p className="text-3xl font-bold text-green-600">{stats.approvedInvoices}</p>
                                        </div>
                                        <CheckCircle className="h-12 w-12 text-green-500 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border-l-4 border-l-purple-500">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                                            <p className="text-3xl font-bold text-purple-600">€{(stats.totalRevenue / 1000).toFixed(1)}k</p>
                                        </div>
                                        <DollarSign className="h-12 w-12 text-purple-500 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border-l-4 border-l-indigo-500">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Total Users</p>
                                            <p className="text-3xl font-bold text-indigo-600">{stats.totalUsers}</p>
                                        </div>
                                        <Users className="h-12 w-12 text-indigo-500 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Secondary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-600">Freelancers</span>
                                        <Badge variant="outline">{stats.totalFreelancers}</Badge>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalFreelancers}</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-600">Clientes</span>
                                        <Badge variant="outline">{stats.totalClients}</Badge>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-600">Proyectos</span>
                                        <Badge variant="outline">{stats.totalProjects}</Badge>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}

                {/* Charts Section */}
                {stats && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Invoice Status Chart - Pie Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Invoice Status Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: "Pending", value: stats.pendingInvoices, fill: "#FFA500" },
                                                { name: "Approved", value: stats.approvedInvoices, fill: "#3B82F6" },
                                                { name: "Paid", value: stats.paidInvoices, fill: "#10B981" },
                                                { name: "Rejected", value: stats.rejectedInvoices, fill: "#EF4444" },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }) => `${name}: ${value}`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            <Cell fill="#FFA500" />
                                            <Cell fill="#3B82F6" />
                                            <Cell fill="#10B981" />
                                            <Cell fill="#EF4444" />
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* User Types Chart - Bar Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>User Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={[
                                            { name: "Clients", value: stats.totalClients },
                                            { name: "Freelancers", value: stats.totalFreelancers },
                                            { name: "Total Users", value: stats.totalUsers },
                                        ]}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#3B82F6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoices</CardTitle>
                            <CardDescription>Gestiona todas las facturas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/admin/invoices">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                    Ver Invoices
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Usuarios</CardTitle>
                            <CardDescription>Gestiona usuarios y permisos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/admin/users">
                                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                                    Ver Usuarios
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Transacciones</CardTitle>
                            <CardDescription>Historial de pagos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/admin/transactions">
                                <Button className="w-full bg-green-600 hover:bg-green-700">
                                    Ver Transacciones
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Admin Settings */}
                <Card className="mt-12">
                    <CardHeader>
                        <CardTitle>Administración de Admins</CardTitle>
                        <CardDescription>Agregar/remover acceso de administrador</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/admin/settings">
                            <Button>
                                Ir a Configuración
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
