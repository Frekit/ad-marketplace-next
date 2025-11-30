"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Edit, MapPin, Clock, MessageSquare, Share2, Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import SkillsInput from "@/components/freelancer/skills-input"
import { useToast } from "@/hooks/use-toast"

interface ProfileData {
    user?: {
        id: string
        email: string
        first_name: string
        last_name: string
        daily_rate?: number
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
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        )
    }

    const fullName = `${formData.first_name} ${formData.last_name}`.trim() || "Mi Perfil"
    const initials = `${formData.first_name[0] || ""}${formData.last_name[0] || ""}`.toUpperCase()

    return (
        <div className="min-h-screen bg-background">
            {/* Top Navigation */}
            <header className="border-b bg-white sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="text-[#FF5C5C] font-bold text-2xl">AdMarket</div>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => router.back()}>
                            Volver
                        </Button>
                    </div>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="pb-8">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Sidebar - Profile Card */}
                        <aside className="lg:col-span-1 space-y-6">
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex-1">
                                        <Input
                                            type="text"
                                            placeholder="Nombre"
                                            value={formData.first_name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, first_name: e.target.value })
                                            }
                                            className="mb-2 font-bold"
                                        />
                                        <Input
                                            type="text"
                                            placeholder="Apellido"
                                            value={formData.last_name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, last_name: e.target.value })
                                            }
                                            className="font-bold"
                                        />
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2 mb-4">
                                    <MapPin className="h-4 w-4 text-gray-600" />
                                    <Input
                                        type="text"
                                        placeholder="Ciudad, País"
                                        value={formData.location}
                                        onChange={(e) =>
                                            setFormData({ ...formData, location: e.target.value })
                                        }
                                        className="text-sm"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-600 mb-2 block">
                                            Tarifa diaria
                                        </label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <span className="absolute left-3 top-3 text-gray-500">€</span>
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
                                                    className="pl-7"
                                                />
                                            </div>
                                            <span className="text-sm text-gray-500 flex items-center">/día</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-600 mb-2 block">
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
                                                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                                            formData.availability === status
                                                                ? "bg-green-600 text-white"
                                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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

                                    <Button className="w-full bg-[#0F4C5C] hover:bg-[#0F4C5C]/90 text-white">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Contactar
                                    </Button>

                                    <Button variant="outline" className="w-full">
                                        Compartir perfil
                                    </Button>
                                </div>
                            </Card>

                            {/* Stats Card */}
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
                            {/* Title and Tags */}
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Ej: Desarrollador Full Stack"
                                        value={formData.first_name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, first_name: e.target.value })
                                        }
                                        className="text-3xl font-bold mb-4"
                                    />
                                </div>
                            </div>

                            {/* About Section */}
                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-4">Sobre mí</h2>
                                <textarea
                                    placeholder="Añade una descripción para presentarte a los clientes. Explica tu experiencia, tus habilidades y qué te hace único."
                                    value={formData.bio}
                                    onChange={(e) =>
                                        setFormData({ ...formData, bio: e.target.value })
                                    }
                                    maxLength={500}
                                    rows={5}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.bio.length}/500 caracteres
                                </p>
                            </Card>

                            {/* Skills Section */}
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold">Habilidades profesionales</h2>
                                </div>
                                <SkillsInput
                                    initialSkills={formData.skills}
                                    onChange={(skills) =>
                                        setFormData({ ...formData, skills })
                                    }
                                />
                            </Card>

                            {/* Experience Section */}
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold">Experiencia</h2>
                                    <Button variant="outline" size="sm" type="button">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Añadir
                                    </Button>
                                </div>
                                <div className="space-y-6">
                                    <p className="text-gray-600 text-sm">
                                        Aún no has añadido experiencia. Haz clic en "Añadir" para comenzar.
                                    </p>
                                </div>
                            </Card>

                            {/* Portfolio Section */}
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold">Portafolio</h2>
                                    <Button variant="outline" size="sm" type="button">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Añadir proyecto
                                    </Button>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    Muestra tus mejores proyectos para destacar tu trabajo.
                                </p>
                            </Card>

                            {/* Submit Buttons */}
                            <div className="flex gap-3 justify-end sticky bottom-0 bg-white p-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-[#FF5C5C] hover:bg-[#FF5C5C]/90 text-white"
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
                        </main>
                    </div>
                </div>
            </form>
        </div>
    )
}
