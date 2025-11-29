"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Star, Briefcase, DollarSign, Mail, Sparkles } from "lucide-react"
import Link from "next/link"

interface MatchBreakdown {
    semantic_similarity: number
    skills_match: number
    rate_fit: number
    availability: number
}

interface FreelancerMatch {
    freelancer: {
        id: string
        email: string
        first_name: string
        last_name: string
        profile: {
            hourly_rate: number
            skills: string[]
            bio: string
            availability: string
            rating: number
            total_jobs: number
        }
    }
    score: number
    explanation: string
    breakdown: MatchBreakdown
}

interface AIMatchResultsProps {
    matches: FreelancerMatch[]
    onClose?: () => void
}

export default function AIMatchResults({ matches, onClose }: AIMatchResultsProps) {
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
    }

    const getScoreColor = (score: number) => {
        if (score >= 0.8) return 'text-green-600'
        if (score >= 0.6) return 'text-yellow-600'
        return 'text-gray-600'
    }

    const getScoreBgColor = (score: number) => {
        if (score >= 0.8) return 'bg-green-100'
        if (score >= 0.6) return 'bg-yellow-100'
        return 'bg-gray-100'
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-[#FF5C5C]" />
                    <h2 className="text-2xl font-bold text-gray-900">
                        Mejores Matches con IA
                    </h2>
                </div>
                {onClose && (
                    <Button variant="outline" onClick={onClose}>
                        Cerrar
                    </Button>
                )}
            </div>

            {matches.length === 0 ? (
                <Card className="p-12">
                    <div className="flex flex-col items-center justify-center text-center">
                        <Sparkles className="h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No se encontraron matches
                        </h3>
                        <p className="text-gray-600 max-w-md">
                            No hay freelancers disponibles que cumplan con los criterios mínimos de compatibilidad.
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-4">
                    {matches.map((match, index) => (
                        <Card key={match.freelancer.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex gap-4">
                                    {/* Avatar and Score */}
                                    <div className="flex flex-col items-center gap-2">
                                        <Avatar className="h-16 w-16">
                                            <AvatarFallback className="bg-[#FF5C5C] text-white text-lg">
                                                {getInitials(match.freelancer.first_name, match.freelancer.last_name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className={`text-center px-3 py-1 rounded-full ${getScoreBgColor(match.score)}`}>
                                            <span className={`text-lg font-bold ${getScoreColor(match.score)}`}>
                                                {(match.score * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                        {index === 0 && (
                                            <Badge className="bg-yellow-500 text-white">
                                                Top Match
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Freelancer Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900">
                                                    {match.freelancer.first_name} {match.freelancer.last_name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {match.freelancer.profile.rating > 0 && (
                                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                            <span>{match.freelancer.profile.rating.toFixed(1)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Briefcase className="h-4 w-4" />
                                                        <span>{match.freelancer.profile.total_jobs || 0} proyectos</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-[#FF5C5C]">
                                                    €{match.freelancer.profile.hourly_rate || 0}/h
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI Explanation */}
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                            <div className="flex items-start gap-2">
                                                <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-blue-900">
                                                    {match.explanation}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Skills */}
                                        {match.freelancer.profile.skills && match.freelancer.profile.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {match.freelancer.profile.skills.slice(0, 6).map((skill, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                                {match.freelancer.profile.skills.length > 6 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{match.freelancer.profile.skills.length - 6} más
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                        {/* Match Breakdown */}
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div>
                                                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                                    <span>Similitud Semántica</span>
                                                    <span>{(match.breakdown.semantic_similarity * 100).toFixed(0)}%</span>
                                                </div>
                                                <Progress value={match.breakdown.semantic_similarity * 100} className="h-1.5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                                    <span>Match de Skills</span>
                                                    <span>{(match.breakdown.skills_match * 100).toFixed(0)}%</span>
                                                </div>
                                                <Progress value={match.breakdown.skills_match * 100} className="h-1.5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                                    <span>Compatibilidad Tarifa</span>
                                                    <span>{(match.breakdown.rate_fit * 100).toFixed(0)}%</span>
                                                </div>
                                                <Progress value={match.breakdown.rate_fit * 100} className="h-1.5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                                    <span>Disponibilidad</span>
                                                    <span>{(match.breakdown.availability * 100).toFixed(0)}%</span>
                                                </div>
                                                <Progress value={match.breakdown.availability * 100} className="h-1.5" />
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Button
                                                className="bg-[#FF5C5C] hover:bg-[#FF5C5C]/90 text-white"
                                                asChild
                                            >
                                                <Link href={`/freelancer/${match.freelancer.id}`}>
                                                    Ver Perfil Completo
                                                </Link>
                                            </Button>
                                            <Button variant="outline">
                                                <Mail className="h-4 w-4 mr-2" />
                                                Invitar al Proyecto
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
    )
}
