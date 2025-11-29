"use client"

import { useState } from "react"
import ClientLayout from "@/components/layouts/ClientLayout"
import FreelancerSearch, { SearchFilters } from "@/components/freelancer-search"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, MapPin, Briefcase, DollarSign, Mail, Loader2 } from "lucide-react"
import Link from "next/link"

type FreelancerProfile = {
    id: string
    hourly_rate: number
    skills: string[]
    bio: string
    availability: string
    rating: number
    total_jobs: number
    total_earnings: number
    profile_completion: number
}

type Freelancer = {
    id: string
    email: string
    first_name: string
    last_name: string
    created_at: string
    profile: FreelancerProfile
}

export default function FindFreelancersPage() {
    const [freelancers, setFreelancers] = useState<Freelancer[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [hasSearched, setHasSearched] = useState(false)

    const handleSearch = async (filters: SearchFilters) => {
        setLoading(true)
        setError("")
        setHasSearched(true)

        try {
            const params = new URLSearchParams()
            if (filters.q) params.append('q', filters.q)
            if (filters.skills.length > 0) params.append('skills', filters.skills.join(','))
            if (filters.minRate > 0) params.append('min_rate', filters.minRate.toString())
            if (filters.maxRate < 200) params.append('max_rate', filters.maxRate.toString())
            if (filters.availability) params.append('availability', filters.availability)
            if (filters.sort) params.append('sort', filters.sort)

            const res = await fetch(`/api/freelancers/search?${params.toString()}`)

            if (res.ok) {
                const data = await res.json()
                setFreelancers(data.freelancers || [])
            } else {
                const errorData = await res.json()
                setError(errorData.error || 'Error al buscar freelancers')
            }
        } catch (err) {
            console.error('Error searching freelancers:', err)
            setError('Error al buscar freelancers')
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setFreelancers([])
        setHasSearched(false)
        setError("")
    }

    const getAvailabilityColor = (availability: string) => {
        switch (availability) {
            case 'available':
                return 'bg-green-100 text-green-700'
            case 'busy':
                return 'bg-yellow-100 text-yellow-700'
            case 'unavailable':
                return 'bg-red-100 text-red-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    const getAvailabilityLabel = (availability: string) => {
        switch (availability) {
            case 'available':
                return 'Disponible'
            case 'busy':
                return 'Ocupado'
            case 'unavailable':
                return 'No disponible'
            default:
                return availability
        }
    }

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
    }

    return (
        <ClientLayout>
            <div className="p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Buscar Freelancers</h1>
                        <p className="text-gray-600 mt-1">Encuentra el talento perfecto para tu proyecto</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Search Sidebar */}
                        <div className="lg:col-span-1">
                            <FreelancerSearch onSearch={handleSearch} onReset={handleReset} />
                        </div>

                        {/* Results */}
                        <div className="lg:col-span-3">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                                    {error}
                                </div>
                            )}

                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-[#FF5C5C]" />
                                </div>
                            ) : !hasSearched ? (
                                <Card className="p-12">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className="mb-6">
                                            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-4">
                                                <Briefcase className="h-12 w-12 text-gray-400" />
                                            </div>
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                            Encuentra tu freelancer ideal
                                        </h2>
                                        <p className="text-gray-600 max-w-md">
                                            Utiliza los filtros de la izquierda para buscar freelancers por habilidades, tarifa y disponibilidad.
                                        </p>
                                    </div>
                                </Card>
                            ) : freelancers.length === 0 ? (
                                <Card className="p-12">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                            No se encontraron resultados
                                        </h2>
                                        <p className="text-gray-600 max-w-md">
                                            Intenta ajustar los filtros de búsqueda para encontrar más freelancers.
                                        </p>
                                    </div>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                        {freelancers.length} freelancer{freelancers.length !== 1 ? 's' : ''} encontrado{freelancers.length !== 1 ? 's' : ''}
                                    </p>
                                    {freelancers.map((freelancer) => (
                                        <Card key={freelancer.id} className="hover:shadow-lg transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex gap-4">
                                                    <Avatar className="h-16 w-16">
                                                        <AvatarFallback className="bg-[#FF5C5C] text-white text-lg">
                                                            {getInitials(freelancer.first_name, freelancer.last_name)}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <h3 className="text-xl font-semibold text-gray-900">
                                                                    {freelancer.first_name} {freelancer.last_name}
                                                                </h3>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Badge className={getAvailabilityColor(freelancer.profile?.availability || 'unavailable')}>
                                                                        {getAvailabilityLabel(freelancer.profile?.availability || 'unavailable')}
                                                                    </Badge>
                                                                    {freelancer.profile?.rating > 0 && (
                                                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                            <span>{freelancer.profile.rating.toFixed(1)}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-2xl font-bold text-[#FF5C5C]">
                                                                    €{freelancer.profile?.hourly_rate || 0}/h
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {freelancer.profile?.bio && (
                                                            <p className="text-gray-600 mb-3 line-clamp-2">
                                                                {freelancer.profile.bio}
                                                            </p>
                                                        )}

                                                        {freelancer.profile?.skills && freelancer.profile.skills.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mb-3">
                                                                {freelancer.profile.skills.slice(0, 8).map((skill, idx) => (
                                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                                        {skill}
                                                                    </Badge>
                                                                ))}
                                                                {freelancer.profile.skills.length > 8 && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        +{freelancer.profile.skills.length - 8} más
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                                            <div className="flex items-center gap-1">
                                                                <Briefcase className="h-4 w-4" />
                                                                <span>{freelancer.profile?.total_jobs || 0} proyectos</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <DollarSign className="h-4 w-4" />
                                                                <span>€{freelancer.profile?.total_earnings?.toFixed(0) || 0} ganados</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-2">
                                                            <Button
                                                                className="bg-[#FF5C5C] hover:bg-[#FF5C5C]/90 text-white"
                                                                asChild
                                                            >
                                                                <Link href={`/freelancer/${freelancer.id}`}>
                                                                    Ver Perfil
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                asChild
                                                            >
                                                                <Link href={`/freelancer/${freelancer.id}/portfolio`}>
                                                                    Portfolio
                                                                </Link>
                                                            </Button>
                                                            <Button variant="outline">
                                                                <Mail className="h-4 w-4 mr-2" />
                                                                Contactar
                                                            </Button>
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
                </div>
            </div>
        </ClientLayout>
    )
}
