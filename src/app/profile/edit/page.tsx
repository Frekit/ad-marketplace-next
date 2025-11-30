"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import FreelancerLayout from "@/components/layouts/FreelancerLayout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import SkillsInput from "@/components/freelancer/skills-input"
import ProfilePictureUpload from "@/components/profile-picture-upload"
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProfileData {
    user?: {
        id: string
        email: string
        first_name: string
        last_name: string
        daily_rate?: number
        avatar_url?: string
    }
    profile?: {
        bio?: string
        hourly_rate?: number
        skills?: string[]
        availability?: string
        location?: string
    }
}

type AvailabilityType = "available" | "busy" | "unavailable"

export default function ProfileEditPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            router.push("/sign-in")
        },
    })

    const [profileData, setProfileData] = useState<ProfileData>({})
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        bio: "",
        hourly_rate: "",
        skills: [] as string[],
        availability: "available" as AvailabilityType,
        location: "",
    })

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/freelancer/profile")
            if (!res.ok) throw new Error("Failed to fetch profile")

            const data: ProfileData = await res.json()
            setProfileData(data)

            if (data.user && data.profile) {
                setFormData({
                    first_name: data.user.first_name || "",
                    last_name: data.user.last_name || "",
                    bio: data.profile.bio || "",
                    hourly_rate: data.profile.hourly_rate?.toString() || data.user.daily_rate?.toString() || "",
                    skills: data.profile.skills || [],
                    availability: (data.profile.availability || "available") as AvailabilityType,
                    location: data.profile.location || "",
                })
            }
        } catch (error) {
            console.error("Error fetching profile:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error al cargar el perfil",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const res = await fetch("/api/freelancer/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || "Failed to update profile")
            }

            toast({
                variant: "success",
                title: "Éxito",
                description: "Perfil actualizado exitosamente",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Error al actualizar el perfil",
            })
        } finally {
            setSaving(false)
        }
    }

    if (status === "loading" || loading) {
        return (
            <FreelancerLayout>
                <div className="p-8 flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
            </FreelancerLayout>
        )
    }

    return (
        <FreelancerLayout>
            <div className="p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="text-text-muted hover:text-text hover:bg-surface-hover"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-text">Editar perfil</h1>
                            <p className="text-text-muted mt-1">Actualiza tu información profesional</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Foto de Perfil */}
                        <Card className="p-6 bg-surface border-border">
                            <h2 className="text-xl font-bold text-text mb-6">Foto de perfil</h2>

                            <div className="flex flex-col items-center gap-6">
                                <Avatar className="h-32 w-32 border-4 border-border">
                                    <AvatarImage
                                        src={profileData.user?.avatar_url}
                                        alt={`${profileData.user?.first_name} ${profileData.user?.last_name}`}
                                    />
                                    <AvatarFallback className="bg-accent text-white text-2xl">
                                        {(profileData.user?.first_name?.[0] || "")}{(profileData.user?.last_name?.[0] || "")}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="w-full">
                                    <ProfilePictureUpload
                                        userId={session?.user?.id || ""}
                                        currentAvatarUrl={profileData.user?.avatar_url}
                                        onUploadComplete={(url) => {
                                            setProfileData(prev => ({
                                                ...prev,
                                                user: { ...prev.user, avatar_url: url } as any
                                            }))
                                        }}
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Información Personal */}
                        <Card className="p-6 bg-surface border-border">
                            <h2 className="text-xl font-bold text-text mb-6">Información personal</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">
                                        Nombre
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, first_name: e.target.value })
                                        }
                                        placeholder="Tu nombre"
                                        className="bg-surface-hover border-border text-text placeholder:text-text-muted"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">
                                        Apellido
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, last_name: e.target.value })
                                        }
                                        placeholder="Tu apellido"
                                        className="bg-surface-hover border-border text-text placeholder:text-text-muted"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    value={profileData.user?.email || ""}
                                    disabled
                                    className="bg-muted border-border text-text-muted cursor-not-allowed"
                                />
                                <p className="text-xs text-text-muted mt-1">
                                    No se puede cambiar el email
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Ubicación
                                </label>
                                <Input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) =>
                                        setFormData({ ...formData, location: e.target.value })
                                    }
                                    placeholder="Ej: Madrid, España"
                                    className="bg-surface-hover border-border text-text placeholder:text-text-muted"
                                />
                            </div>
                        </Card>

                        {/* Información Profesional */}
                        <Card className="p-6 bg-surface border-border">
                            <h2 className="text-xl font-bold text-text mb-6">Información profesional</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">
                                        Tarifa diaria (€/día)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-text-muted">€</span>
                                        <Input
                                            type="number"
                                            placeholder="100"
                                            min="20"
                                            max="5000"
                                            step="1"
                                            value={formData.hourly_rate}
                                            onChange={(e) =>
                                                setFormData({ ...formData, hourly_rate: e.target.value })
                                            }
                                            className="pl-7 bg-surface-hover border-border text-text placeholder:text-text-muted"
                                        />
                                    </div>
                                    <p className="text-xs text-text-muted mt-1">
                                        Se usa para comparar propuestas
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">
                                        Disponibilidad
                                    </label>
                                    <div className="flex gap-2">
                                        {(["available", "busy", "unavailable"] as AvailabilityType[]).map(
                                            (status) => (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    onClick={() =>
                                                        setFormData({ ...formData, availability: status })
                                                    }
                                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                                                        formData.availability === status
                                                            ? "bg-primary text-white"
                                                            : "bg-surface-hover text-text-muted hover:bg-surface-hover border border-border"
                                                    }`}
                                                >
                                                    {status === "available" && "Disponible"}
                                                    {status === "busy" && "Ocupado"}
                                                    {status === "unavailable" && "No disponible"}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Biografía / Descripción
                                </label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) =>
                                        setFormData({ ...formData, bio: e.target.value })
                                    }
                                    placeholder="Cuéntale a los clientes sobre ti, tu experiencia y especialidades..."
                                    maxLength={500}
                                    rows={5}
                                    className="w-full px-3 py-2 bg-surface-hover border border-border text-text placeholder:text-text-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                                <p className="text-xs text-text-muted mt-1">
                                    {formData.bio.length}/500 caracteres
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-3">
                                    Habilidades
                                </label>
                                <SkillsInput
                                    initialSkills={formData.skills}
                                    onChange={(skills) =>
                                        setFormData({ ...formData, skills })
                                    }
                                />
                            </div>
                        </Card>

                        {/* Botones de acción */}
                        <div className="flex gap-3 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                className="border-border text-text hover:bg-surface-hover"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="bg-primary hover:bg-primary/90 text-white"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    "Guardar cambios"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </FreelancerLayout>
    )
}
