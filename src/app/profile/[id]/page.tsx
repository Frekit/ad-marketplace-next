"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, Globe, Menu, MapPin, Clock, MessageSquare, Star, CheckCircle2, Edit, Share2 } from "lucide-react"
import Link from "next/link"

export default function PublicProfilePage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Top Navigation */}
            <header className="border-b bg-white sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="text-[#FF5C5C] font-bold text-2xl">malt</div>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                            <Search className="h-5 w-5 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full relative">
                            <Bell className="h-5 w-5 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                            <Globe className="h-5 w-5 text-gray-600" />
                        </button>
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-[#FF5C5C] text-white text-sm">AR</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </header>

            {/* Profile Incomplete Warning */}
            <div className="bg-yellow-50 border-b border-yellow-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <span className="text-yellow-700 font-bold">!</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Tu perfil no está completo</h3>
                                <p className="text-sm text-gray-700">
                                    Para ser visible en los motores de búsqueda, tu perfil debe estar completo al 100%. Completa los siguientes pasos para aumentar tu visibilidad y recibir más propuestas de proyecto.
                                </p>
                            </div>
                        </div>
                        <Button className="bg-[#FF5C5C] hover:bg-[#FF5C5C]/90 text-white whitespace-nowrap">
                            Completar mi perfil
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Sidebar */}
                    <aside className="lg:col-span-1 space-y-6">
                        {/* Profile Card */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-lg">Alvaro Romero</h2>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                <MapPin className="h-4 w-4" />
                                <span>Madrid, España</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">Tarifa diaria</div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold">100 €</span>
                                        <span className="text-sm text-gray-500">/día</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-600 mb-1">Disponibilidad</div>
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Disponible</Badge>
                                </div>

                                <Button className="w-full bg-[#0F4C5C] hover:bg-[#0F4C5C]/90 text-white">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Contactar
                                </Button>

                                <Button variant="outline" className="w-full">
                                    Compartir perfil
                                </Button>
                            </div>
                        </Card>

                        {/* Profile Completion */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold">Completar mi perfil</h3>
                                <span className="text-sm text-gray-600">35%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                <div className="bg-[#0F4C5C] h-2 rounded-full" style={{ width: '35%' }}></div>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>
                                    <span>Añadir una foto de perfil</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>
                                    <span>Perfil: Añadir tu descripción</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>
                                    <span>Añadir tu experiencia</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>
                                    <span>Completar tu información</span>
                                </div>
                            </div>
                        </Card>

                        {/* Stats */}
                        <Card className="p-6">
                            <h3 className="font-bold mb-4">Estadísticas</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">Tiempo de respuesta</div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span className="font-medium">-</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">Proyectos completados</div>
                                    <div className="font-medium">0</div>
                                </div>
                            </div>
                        </Card>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-2 space-y-6">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Global Strategic Planner</h1>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">coma</Badge>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Test driven development</Badge>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Strategic Planning</Badge>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Comms Strategy</Badge>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </Button>
                        </div>

                        {/* About Section */}
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4">Sobre mí</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Añade una descripción para presentarte a los clientes. Explica tu experiencia, tus habilidades y qué te hace único.
                            </p>
                            <Button variant="outline" className="mt-4">
                                Añadir descripción
                            </Button>
                        </Card>

                        {/* Skills Section */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">Habilidades profesionales</h2>
                                <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="text-sm">coma</Badge>
                                <Badge variant="outline" className="text-sm">Test driven development</Badge>
                                <Badge variant="outline" className="text-sm">Strategic Planning</Badge>
                                <Badge variant="outline" className="text-sm">Comms Strategy</Badge>
                            </div>
                        </Card>

                        {/* Experience Section */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">Experiencia</h2>
                                <Button variant="outline" size="sm">
                                    Añadir experiencia
                                </Button>
                            </div>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                                        <span className="text-gray-400 text-xs">Logo</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold">Corporación SA</h3>
                                        <p className="text-sm text-gray-600">Jefe de proyecto</p>
                                        <p className="text-xs text-gray-500">Mayo de 2023 - En curso</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Portfolio */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">Portafolio</h2>
                                <Button variant="outline" size="sm">
                                    Añadir proyecto
                                </Button>
                            </div>
                            <p className="text-gray-600 text-sm">
                                Muestra tus mejores proyectos para destacar tu trabajo.
                            </p>
                        </Card>
                    </main>
                </div>
            </div>
        </div>
    )
}
