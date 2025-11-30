"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Star, MapPin, Briefcase, MessageCircle, Loader2 } from "lucide-react"

interface Freelancer {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  hourlyRate: number
  location: string
  bio: string
  skills: string[]
  availability: string
  avatarUrl?: string
  portfolio: any[]
  experience: any[]
  certifications: string[]
  rating: number
  reviewCount: number
}

export default function FreelancerProfilePage() {
  const params = useParams()
  const id = params.id as string
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) return

    const fetchFreelancer = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/freelancers/${id}`)

        if (!res.ok) {
          throw new Error("Failed to fetch freelancer")
        }

        const data = await res.json()
        setFreelancer(data)
      } catch (err) {
        console.error("Error fetching freelancer:", err)
        setError(err instanceof Error ? err.message : "Error loading profile")
      } finally {
        setLoading(false)
      }
    }

    fetchFreelancer()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  if (error || !freelancer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-surface border-border p-8">
          <p className="text-danger text-center mb-4">Error al cargar el perfil</p>
          <p className="text-text-muted text-sm text-center">{error}</p>
        </Card>
      </div>
    )
  }

  const initials = `${freelancer.firstName[0]}${freelancer.lastName[0]}`.toUpperCase()
  const fullName = `${freelancer.firstName} ${freelancer.lastName}`

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-primary cursor-pointer">AdMarket</h1>
          </Link>
          <nav className="flex gap-4 items-center">
            <Link href="/">
              <Button variant="ghost" className="text-text hover:text-text hover:bg-surface-hover">
                Explorar
              </Button>
            </Link>
            <Link href="/profile">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Mi Perfil
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-surface to-background border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <Avatar className="h-40 w-40 border-4 border-primary shrink-0">
              <AvatarImage src={freelancer.avatarUrl} alt={fullName} />
              <AvatarFallback className="bg-accent text-white text-3xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-text mb-2">{fullName}</h1>
              <p className="text-xl text-text-secondary mb-4">{freelancer.role}</p>

              <div className="flex flex-wrap gap-6 mb-6">
                {freelancer.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-warning text-warning" />
                    <span className="font-semibold text-text">{freelancer.rating}</span>
                    <span className="text-text-muted">({freelancer.reviewCount} reviews)</span>
                  </div>
                )}
                {freelancer.location && (
                  <div className="flex items-center gap-2 text-text-muted">
                    <MapPin className="h-5 w-5" />
                    <span>{freelancer.location}</span>
                  </div>
                )}
                {freelancer.hourlyRate > 0 && (
                  <div className="flex items-center gap-2 text-text-muted">
                    <Briefcase className="h-5 w-5" />
                    <span>€{freelancer.hourlyRate}/día</span>
                  </div>
                )}
              </div>

              <p className="text-lg text-text-secondary mb-6 max-w-3xl">{freelancer.bio}</p>

              {/* Availability Badge */}
              {freelancer.availability && (
                <div className="mb-6">
                  <Badge
                    className={`${
                      freelancer.availability === "available"
                        ? "bg-success text-black"
                        : freelancer.availability === "busy"
                          ? "bg-warning text-black"
                          : "bg-muted text-text-muted"
                    }`}
                  >
                    {freelancer.availability === "available" && "✓ Disponible"}
                    {freelancer.availability === "busy" && "⏱ Ocupado"}
                    {freelancer.availability === "unavailable" && "✕ No disponible"}
                  </Badge>
                </div>
              )}

              <div className="flex gap-3">
                <Link href={`/messages?freelancer_id=${freelancer.id}`}>
                  <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
                    <MessageCircle className="h-4 w-4" />
                    Contactar
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-border text-text hover:bg-surface-hover">
                  Contratar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skills */}
            {freelancer.skills && freelancer.skills.length > 0 && (
              <Card className="bg-surface border-border">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-text mb-4">Habilidades</h2>
                  <div className="flex flex-wrap gap-2">
                    {freelancer.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="bg-accent/20 text-accent">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Portfolio */}
            {freelancer.portfolio && freelancer.portfolio.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-text mb-6">Portafolio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {freelancer.portfolio.map((project: any) => (
                    <Card
                      key={project.id}
                      className="bg-surface border-border overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-primary/10">
                          {project.id}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-text mb-2">{project.title}</h3>
                        <p className="text-sm text-text-muted mb-3">{project.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {project.tags?.map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {freelancer.experience && freelancer.experience.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-text mb-6">Experiencia</h2>
                <div className="space-y-6">
                  {freelancer.experience.map((exp: any, idx: number) => (
                    <Card key={idx} className="bg-surface border-border">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Briefcase className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-text">{exp.title}</h3>
                            <p className="text-text-muted mb-2">{exp.company}</p>
                            <p className="text-xs text-text-muted mb-3">{exp.period}</p>
                            <p className="text-sm text-text-secondary">{exp.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Rate Card */}
            {freelancer.hourlyRate > 0 && (
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-text-muted mb-2">Tarifa diaria</p>
                    <p className="text-4xl font-bold text-primary mb-4">€{freelancer.hourlyRate}</p>
                    <p className="text-sm text-text-muted mb-4">por día</p>
                    <Link href={`/messages?freelancer_id=${freelancer.id}`}>
                      <Button className="w-full mb-2 bg-primary hover:bg-primary/90 text-white">
                        Contactar
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full border-border text-text hover:bg-surface-hover">
                      Contratar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {freelancer.certifications && freelancer.certifications.length > 0 && (
              <Card className="bg-surface border-border">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-text mb-4">Certificaciones</h3>
                  <ul className="space-y-3">
                    {freelancer.certifications.map((cert: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <span className="text-sm text-text-secondary">{cert}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
