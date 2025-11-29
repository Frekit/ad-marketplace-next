"use client"

import FreelancerLayout from "@/components/layouts/FreelancerLayout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, Calendar, TrendingUp, Users, MessageSquare } from "lucide-react"

export default function FreelancerDashboard() {
    const profileCompletion = 35

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
                            <h1 className="text-3xl font-bold text-gray-900">Bienvenido de nuevo Alvaro</h1>
                            <p className="text-gray-600 mt-1">Aquí está un resumen de tu actividad reciente</p>
                        </div>
                        <Button className="bg-[#FF5C5C] hover:bg-[#FF5C5C]/90 text-white">
                            Completar mi perfil
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Vistas del perfil</span>
                                <Users className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900">0</div>
                            <p className="text-xs text-gray-500 mt-1">En los últimos 30 días</p>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Propuestas recibidas</span>
                                <MessageSquare className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900">0</div>
                            <p className="text-xs text-gray-500 mt-1">En los últimos 30 días</p>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Proyectos activos</span>
                                <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900">0</div>
                            <p className="text-xs text-gray-500 mt-1">Proyectos en curso</p>
                        </Card>
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
